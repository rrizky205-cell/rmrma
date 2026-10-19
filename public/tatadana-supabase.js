/**
 * TataDana Supabase Cloud Storage & Realtime Synchronization Layer
 * Handles reading & writing data to Supabase PostgreSQL tables
 * with seamless graceful fallback to local state if tables are not yet created.
 */

(function () {
    const SUPABASE_CONFIG = {
        url: 'https://wchpkvxjufjujaganaca.supabase.co',
        anonKey: 'sb_publishable_qBhFiLibDHVoM22HjP0Vvw_Gtw_fpbd'
    };

    const headers = {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates'
    };

    // Helper: REST fetch with timeout & error handling
    async function restFetch(endpoint, options = {}) {
        const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        try {
            const res = await fetch(url, {
                ...options,
                headers: { ...headers, ...(options.headers || {}) },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return res;
        } catch (err) {
            clearTimeout(timeoutId);
            return null;
        }
    }

    const TatadanaSupabase = {
        config: SUPABASE_CONFIG,

        // 1. Fetch entire financial state from Supabase tables
        async fetchState() {
            try {
                // First try app_state KV store for instant snapshot
                const kvRes = await restFetch('app_state?key=eq.global_state&select=*');
                if (kvRes && kvRes.ok) {
                    const kvData = await kvRes.json();
                    if (Array.isArray(kvData) && kvData.length > 0 && kvData[0].data) {
                        return kvData[0].data;
                    }
                }

                // Otherwise fetch individual relational tables
                const [wRes, txRes, bRes, cRes, chRes, uRes] = await Promise.all([
                    restFetch('wallets?select=*'),
                    restFetch('transactions?select=*&order=datetime.desc'),
                    restFetch('budgets?select=*'),
                    restFetch('custom_categories?select=*'),
                    restFetch('chat_history?select=*&order=time.desc'),
                    restFetch('users?select=*')
                ]);

                if (!wRes || !wRes.ok) return null; // Table not ready yet, fallback to local state

                const wallets = (await wRes.json()) || [];
                const transactions = (txRes && txRes.ok) ? await txRes.json() : [];
                const budgets = (bRes && bRes.ok) ? await bRes.json() : [];
                const catsRaw = (cRes && cRes.ok) ? await cRes.json() : [];
                const chats = (chRes && chRes.ok) ? await chRes.json() : [];
                const users = (uRes && uRes.ok) ? await uRes.json() : [];

                return {
                    wallets: wallets.map(w => ({
                        id: w.id,
                        name: w.name,
                        balance: Number(w.balance || 0),
                        type: w.type || 'bank',
                        color: w.color || '#0066AE',
                        isDefault: !!w.isDefault
                    })),
                    transactions: transactions.map(t => ({
                        id: t.id,
                        type: t.type,
                        amount: Number(t.amount || 0),
                        walletId: t.walletId,
                        walletName: t.walletName,
                        targetWalletId: t.targetWalletId,
                        targetWalletName: t.targetWalletName,
                        category: t.category,
                        note: t.note,
                        date: t.date,
                        datetime: t.datetime
                    })),
                    budgets: budgets.map(b => ({
                        id: b.id,
                        name: b.name,
                        limit: Number(b.limit_amount || b.limit || 0),
                        color: b.color || '#facc15'
                    })),
                    customCategories: catsRaw.map(c => c.name),
                    chatHistory: chats.map(c => ({
                        id: c.id,
                        sender: c.sender,
                        text: c.text,
                        reply: c.reply,
                        time: c.time,
                        platform: c.platform || 'web'
                    })),
                    users: users
                };
            } catch (err) {
                console.warn('[Supabase Sync] Read fallback to local state:', err.message);
                return null;
            }
        },

        // 2. Save/Upsert current state to Supabase
        async saveState(state) {
            if (!state) return false;
            try {
                // 1. Snapshot save to app_state KV table (preserve users snapshot)
                let stateToSave = { ...state };
                if (!Array.isArray(stateToSave.users) || stateToSave.users.length === 0) {
                    try {
                        const rawU = localStorage.getItem('tatadana_all_users');
                        if (rawU) stateToSave.users = JSON.parse(rawU);
                    } catch (e) {}
                }
                restFetch('app_state', {
                    method: 'POST',
                    headers: { 'Prefer': 'resolution=merge-duplicates' },
                    body: JSON.stringify({
                        key: 'global_state',
                        data: stateToSave,
                        updated_at: new Date().toISOString()
                    })
                }).catch(() => {});

                // 2. Upsert Wallets
                if (Array.isArray(state.wallets) && state.wallets.length > 0) {
                    const wPayload = state.wallets.map(w => ({
                        id: w.id,
                        name: w.name,
                        balance: w.balance,
                        type: w.type,
                        color: w.color,
                        "isDefault": !!w.isDefault,
                        updated_at: new Date().toISOString()
                    }));
                    restFetch('wallets', {
                        method: 'POST',
                        body: JSON.stringify(wPayload)
                    }).catch(() => {});
                }

                // 3. Upsert Transactions
                if (Array.isArray(state.transactions) && state.transactions.length > 0) {
                    const txPayload = state.transactions.slice(0, 50).map(t => ({
                        id: t.id,
                        type: t.type,
                        amount: t.amount,
                        "walletId": t.walletId || null,
                        "walletName": t.walletName || null,
                        "targetWalletId": t.targetWalletId || null,
                        "targetWalletName": t.targetWalletName || null,
                        category: t.category,
                        note: t.note,
                        date: t.date,
                        datetime: t.datetime
                    }));
                    restFetch('transactions', {
                        method: 'POST',
                        body: JSON.stringify(txPayload)
                    }).catch(() => {});
                }

                // 4. Upsert Chat History
                if (Array.isArray(state.chatHistory) && state.chatHistory.length > 0) {
                    const chPayload = state.chatHistory.slice(0, 30).map(c => ({
                        id: c.id,
                        sender: c.sender || 'web_user',
                        text: c.text,
                        reply: c.reply || '',
                        time: c.time || '',
                        platform: c.platform || 'web'
                    }));
                    restFetch('chat_history', {
                        method: 'POST',
                        body: JSON.stringify(chPayload)
                    }).catch(() => {});
                }

                // 5. Upsert Users
                if (Array.isArray(state.users) && state.users.length > 0) {
                    const uPayload = state.users.map(u => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        phone: u.phone,
                        "registeredAt": u.registeredAt,
                        plan: u.plan,
                        "paymentStatus": u.paymentStatus,
                        "paymentMethod": u.paymentMethod,
                        role: u.role,
                        "telegramUsername": u.telegramUsername,
                        "senderName": u.senderName || null,
                        "senderAccount": u.senderAccount || null,
                        "proofImage": u.proofImage || null,
                        "paymentAmount": u.paymentAmount || null
                    }));
                    restFetch('users', {
                        method: 'POST',
                        body: JSON.stringify(uPayload)
                    }).catch(() => {});
                }

                return true;
            } catch (err) {
                console.warn('[Supabase Sync] Write error:', err.message);
                return false;
            }
        },

        // 3. Fetch users list from Supabase
        async fetchUsers() {
            try {
                const userMap = new Map();

                // 3a. Primary dedicated KV snapshot: app_state key 'tatadana_users'
                try {
                    const kvUsersRes = await restFetch('app_state?key=eq.tatadana_users&select=*');
                    if (kvUsersRes && kvUsersRes.ok) {
                        const kvUsersData = await kvUsersRes.json();
                        if (Array.isArray(kvUsersData) && kvUsersData.length > 0 && Array.isArray(kvUsersData[0].data)) {
                            kvUsersData[0].data.forEach(u => {
                                if (u && (u.email || u.id)) userMap.set(u.email || u.id, u);
                            });
                        }
                    }
                } catch (e) {}

                // 3b. Direct relational table query (unrestricted query to avoid PostgreSQL column casing mismatches)
                try {
                    const res = await restFetch('users?select=*');
                    if (res && res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            data.forEach(u => {
                                if (u && (u.email || u.id)) {
                                    const key = u.email || u.id;
                                    const prev = userMap.get(key);
                                    userMap.set(key, { ...(prev || {}), ...u });
                                }
                            });
                        }
                    }
                } catch (e) {}

                // 3c. Backup snapshot in global_state
                try {
                    const kvRes = await restFetch('app_state?key=eq.global_state&select=*');
                    if (kvRes && kvRes.ok) {
                        const kvData = await kvRes.json();
                        if (Array.isArray(kvData) && kvData.length > 0 && kvData[0].data && Array.isArray(kvData[0].data.users)) {
                            kvData[0].data.users.forEach(u => {
                                if (u && (u.email || u.id)) {
                                    const key = u.email || u.id;
                                    const prev = userMap.get(key);
                                    userMap.set(key, { ...(prev || {}), ...u });
                                }
                            });
                        }
                    }
                } catch (e) {}

                const list = Array.from(userMap.values());
                list.sort((a, b) => {
                    const ta = new Date(a.registeredAt || a.created_at || 0).getTime();
                    const tb = new Date(b.registeredAt || b.created_at || 0).getTime();
                    return tb - ta;
                });
                return list;
            } catch (err) {
                return [];
            }
        },

        // 4. Save/Upsert single user to Supabase
        async saveUser(u) {
            if (!u) return false;
            try {
                // 4a. Format safe payload for PostgreSQL users table (strictly standard table columns)
                const uPayload = [{
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone,
                    "registeredAt": u.registeredAt,
                    plan: u.plan,
                    "paymentStatus": u.paymentStatus,
                    "paymentMethod": u.paymentMethod,
                    role: u.role,
                    "telegramUsername": u.telegramUsername || '-',
                    "senderName": u.senderName || null,
                    "senderAccount": u.senderAccount || null,
                    "proofImage": u.proofImage || null,
                    "paymentAmount": u.paymentAmount ? Number(u.paymentAmount) : null
                }];

                // Direct table upsert
                await restFetch('users', {
                    method: 'POST',
                    headers: { 'Prefer': 'resolution=merge-duplicates' },
                    body: JSON.stringify(uPayload)
                });

                // 4b. Dedicated persistent KV row in app_state (key: tatadana_users)
                try {
                    let userList = [u];
                    const kvUsersRes = await restFetch('app_state?key=eq.tatadana_users&select=*');
                    if (kvUsersRes && kvUsersRes.ok) {
                        const kvData = await kvUsersRes.json();
                        if (Array.isArray(kvData) && kvData.length > 0 && Array.isArray(kvData[0].data)) {
                            userList = [u, ...kvData[0].data.filter(x => x.email !== u.email && x.id !== u.id)];
                        }
                    }
                    await restFetch('app_state', {
                        method: 'POST',
                        headers: { 'Prefer': 'resolution=merge-duplicates' },
                        body: JSON.stringify({
                            key: 'tatadana_users',
                            data: userList,
                            updated_at: new Date().toISOString()
                        })
                    });
                } catch (e) {}

                // 4c. Also update global_state users snapshot
                try {
                    const kvRes = await restFetch('app_state?key=eq.global_state&select=*');
                    if (kvRes && kvRes.ok) {
                        const kvData = await kvRes.json();
                        let state = (Array.isArray(kvData) && kvData.length > 0 && kvData[0].data) ? kvData[0].data : {};
                        if (!Array.isArray(state.users)) state.users = [];
                        state.users = [u, ...state.users.filter(x => x.email !== u.email && x.id !== u.id)];
                        await restFetch('app_state', {
                            method: 'POST',
                            headers: { 'Prefer': 'resolution=merge-duplicates' },
                            body: JSON.stringify({
                                key: 'global_state',
                                data: state,
                                updated_at: new Date().toISOString()
                            })
                        });
                    }
                } catch (e) {}

                return true;
            } catch (err) {
                console.warn('[Supabase Sync] saveUser error:', err);
                return false;
            }
        },

        // 5. Update user status in Supabase (for approval / reject)
        async updateUserStatus(identifier, plan, paymentStatus, role) {
            try {
                const updatePayload = {
                    plan: plan,
                    "paymentStatus": paymentStatus,
                    role: role
                };

                // Direct table updates
                await Promise.allSettled([
                    restFetch(`users?id=eq.${encodeURIComponent(identifier)}`, {
                        method: 'PATCH',
                        body: JSON.stringify(updatePayload)
                    }),
                    restFetch(`users?email=eq.${encodeURIComponent(identifier)}`, {
                        method: 'PATCH',
                        body: JSON.stringify(updatePayload)
                    })
                ]);

                // Update app_state dedicated key: tatadana_users
                try {
                    const kvUsersRes = await restFetch('app_state?key=eq.tatadana_users&select=*');
                    if (kvUsersRes && kvUsersRes.ok) {
                        const kvData = await kvUsersRes.json();
                        if (Array.isArray(kvData) && kvData.length > 0 && Array.isArray(kvData[0].data)) {
                            let users = kvData[0].data;
                            let changed = false;
                            users = users.map(u => {
                                if (u.id === identifier || u.email === identifier || u.name === identifier) {
                                    changed = true;
                                    return { ...u, plan, paymentStatus, role };
                                }
                                return u;
                            });
                            if (changed) {
                                await restFetch('app_state', {
                                    method: 'POST',
                                    headers: { 'Prefer': 'resolution=merge-duplicates' },
                                    body: JSON.stringify({
                                        key: 'tatadana_users',
                                        data: users,
                                        updated_at: new Date().toISOString()
                                    })
                                });
                            }
                        }
                    }
                } catch (e) {}

                // Update app_state global_state
                try {
                    const kvRes = await restFetch('app_state?key=eq.global_state&select=*');
                    if (kvRes && kvRes.ok) {
                        const kvData = await kvRes.json();
                        let state = (Array.isArray(kvData) && kvData.length > 0 && kvData[0].data) ? kvData[0].data : null;
                        if (state && Array.isArray(state.users)) {
                            let changed = false;
                            state.users = state.users.map(u => {
                                if (u.id === identifier || u.email === identifier || u.name === identifier) {
                                    changed = true;
                                    return { ...u, plan, paymentStatus, role };
                                }
                                return u;
                            });
                            if (changed) {
                                await restFetch('app_state', {
                                    method: 'POST',
                                    headers: { 'Prefer': 'resolution=merge-duplicates' },
                                    body: JSON.stringify({
                                        key: 'global_state',
                                        data: state,
                                        updated_at: new Date().toISOString()
                                    })
                                });
                            }
                        }
                    }
                } catch (e) {}

                return true;
            } catch (e) {
                console.warn('[Supabase Sync] updateUserStatus error:', e);
                return false;
            }
        }
    };

    window.TatadanaSupabase = TatadanaSupabase;
})();

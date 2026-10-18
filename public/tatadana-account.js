/**
 * TataDana Unified Account & Authentication Manager
 * Handles:
 *  - Persistent User Authentication (localStorage: 'tatadana_user')
 *  - Clean Guest/Public state handling without false auto-logins
 *  - Interactive "Akun" Menu & Dropdown Modal across all pages
 *  - Telegram Bot Sync Status (@DANATATA_BOT)
 *  - Account Switcher & Smooth Logout
 *  - Responsive Mobile Navigation Drawer
 *  - High-Contrast Ultra-Visible Cyber Cursor (SVG data URI, zero lag, high contrast on dark & light)
 */

(function () {
    const USER_STORAGE_KEY = 'tatadana_user';

    // Default Pro Account Data (for demo & initial login presets)
    const DEFAULT_PROFILE = {
        name: 'Budi Pratama',
        email: 'budi@tatadana.id',
        phone: '+62 812-3456-7890',
        role: 'Pro Quantum',
        avatar: 'BP',
        telegramBot: '@DANATATA_BOT'
    };

    // 1. Get Current User State (Correctly returns isLoggedIn: false when no active session exists)
    window.getTataDanaUser = function () {
        try {
            const raw = localStorage.getItem(USER_STORAGE_KEY);
            if (!raw) {
                return {
                    name: 'Tamu / Belum Masuk',
                    email: '',
                    phone: '',
                    role: 'Mode Publik',
                    avatar: '👤',
                    telegramBot: '@DANATATA_BOT',
                    isLoggedIn: false
                };
            }
            const user = JSON.parse(raw);
            if (typeof user.isLoggedIn === 'undefined') {
                user.isLoggedIn = true;
            }
            return user;
        } catch (e) {
            return {
                name: 'Tamu / Belum Masuk',
                email: '',
                phone: '',
                role: 'Mode Publik',
                avatar: '👤',
                telegramBot: '@DANATATA_BOT',
                isLoggedIn: false
            };
        }
    };

    // 2. Set User State
    window.setTataDanaUser = function (userData) {
        try {
            const curr = window.getTataDanaUser();
            const updated = { ...curr, ...userData };
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
            window.updateAccountUI();
            return updated;
        } catch (e) {
            console.error('Failed to save user state:', e);
        }
    };

    // 3. Login Action
    window.loginTataDana = function (email, name, phone) {
        const finalEmail = (email && email.trim()) ? email.trim() : DEFAULT_PROFILE.email;
        const rawName = (name && name.trim()) ? name.trim() : (finalEmail.split('@')[0] || DEFAULT_PROFILE.name);
        
        // Capitalize name nicely
        const displayName = rawName.split(/[\s._-]+/)
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');

        const initials = displayName.split(' ')
            .filter(Boolean)
            .map(w => w[0].toUpperCase())
            .join('')
            .substring(0, 2) || 'BP';

        const user = {
            name: displayName || DEFAULT_PROFILE.name,
            email: finalEmail,
            phone: phone || DEFAULT_PROFILE.phone,
            role: 'Pro Quantum',
            avatar: initials,
            telegramBot: '@DANATATA_BOT',
            isLoggedIn: true,
            lastLogin: new Date().toISOString()
        };

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        window.updateAccountUI();

        if (typeof window.showTataDanaToast === 'function') {
            window.showTataDanaToast(`Login berhasil sebagai ${user.name}! Mengalihkan...`, 'success');
        }
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 400);
        return user;
    };

    // 3b. Register New User Action (Mereset data transaksi akun baru mulai dari 0 dan sinkronisasi ke Admin)
    window.registerTataDanaUser = async function (formData) {
        const rawName = (formData.name && formData.name.trim()) ? formData.name.trim() : 'Pengguna Baru';
        const finalEmail = (formData.email && formData.email.trim()) ? formData.email.trim() : 'user@tatadana.id';
        const phone = (formData.phone && formData.phone.trim()) ? formData.phone.trim() : '+62 812-0000-0000';
        const plan = (formData.plan && formData.plan.toLowerCase().includes('pro')) ? 'Pro' : 'Gratis';
        const paymentMethod = formData.paymentMethod || (plan === 'Pro' ? 'BCA Transfer' : '-');
        const paymentStatus = (plan === 'Pro') ? 'Pending Approval' : 'Aktif';

        const displayName = rawName.split(/[\s._-]+/)
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');

        const initials = displayName.split(' ')
            .filter(Boolean)
            .map(w => w[0].toUpperCase())
            .join('')
            .substring(0, 2) || 'TD';

        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

        const durationRaw = formData.duration || formData.planDuration || (plan === 'Pro' ? '6bulan' : 'lifetime');
        const is6Bulan = durationRaw.toString().toLowerCase().includes('6') || durationRaw.toString().toLowerCase() === '6bulan';
        const planDuration = is6Bulan ? '6bulan' : 'lifetime';
        const durationLabel = is6Bulan ? '6 Bulan' : 'Lifetime';
        const defaultAmount = plan === 'Pro' ? (is6Bulan ? 24999 : 49999) : 0;
        const paymentAmount = (formData.amount || formData.paymentAmount || defaultAmount);

        const newUser = {
            id: 'usr_' + Date.now(),
            name: displayName,
            email: finalEmail,
            phone: phone,
            plan: plan,
            duration: planDuration,
            planDuration: planDuration,
            durationLabel: durationLabel,
            amount: paymentAmount,
            paymentAmount: paymentAmount,
            planAmount: paymentAmount,
            senderName: formData.senderName || displayName,
            senderAccount: formData.senderAccount || '-',
            proofImage: formData.proofImage || '',
            role: (plan === 'Pro') ? 'Pro (Pending)' : 'Starter',
            paymentStatus: paymentStatus,
            paymentMethod: paymentMethod,
            avatar: initials,
            telegramBot: '@DANATATA_BOT',
            isLoggedIn: true,
            registeredAt: dateStr,
            lastLogin: now.toISOString()
        };

        // 1. Send to server /api/register to persist in tatadana_state.json & reset server-side state
        const cleanZeroState = {
            wallets: [
                { id: "w1", name: "BCA", balance: 0, type: "bank", color: "#0066AE", isDefault: true },
                { id: "w2", name: "Mandiri", balance: 0, type: "bank", color: "#003D79", isDefault: false },
                { id: "w3", name: "GoPay", balance: 0, type: "ewallet", color: "#00AED6", isDefault: false },
                { id: "w4", name: "Cash", balance: 0, type: "cash", color: "#10B981", isDefault: false }
            ],
            budgets: [],
            customCategories: [],
            chatHistory: [
                {
                    id: "ch_init_" + Date.now(),
                    sender: "system",
                    text: `Pendaftaran akun baru: ${displayName} (${finalEmail})`,
                    reply: "Selamat datang di TataDana! Seluruh saldo, budgeting, dan transaksi Anda telah di-reset mulai dari Rp0. Hubungkan bot @DANATATA_BOT untuk mencatat otomatis.",
                    time: dateStr,
                    platform: "web"
                }
            ],
            transactions: [],
            deletedTxIds: [],
            deletedWalletIds: []
        };

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: displayName,
                    email: finalEmail,
                    phone: phone,
                    plan: plan,
                    duration: planDuration,
                    planDuration: planDuration,
                    durationLabel: durationLabel,
                    amount: paymentAmount,
                    paymentAmount: paymentAmount,
                    planAmount: paymentAmount,
                    paymentMethod: paymentMethod,
                    senderName: formData.senderName || displayName,
                    senderAccount: formData.senderAccount || '-',
                    proofImage: formData.proofImage || ''
                })
            });
            if (!res.ok) {
                // Fallback to updating state directly via /api/state if server has not restarted
                const stRes = await fetch('/api/state');
                if (stRes.ok) {
                    const st = await stRes.json();
                    st.transactions = [];
                    st.budgets = [];
                    st.deletedTxIds = [];
                    st.wallets = cleanZeroState.wallets;
                    st.chatHistory = cleanZeroState.chatHistory;
                    if (!st.users) st.users = [];
                    st.users = [newUser, ...st.users.filter(u => u.email !== finalEmail)];
                    await fetch('/api/state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(st)
                    });
                }
            }
        } catch (e) {
            console.warn('Network registration sync warning:', e);
        }

        // 2. Clear & Reset local storage state to clean Rp0 state
        try {
            localStorage.setItem('tatadana_state_v2', JSON.stringify(cleanZeroState));
            localStorage.removeItem('tatadana_transactions');
            localStorage.removeItem('tatadana_budgets');
            localStorage.setItem('tatadana_budgets', '[]');
            localStorage.removeItem('tatadana_wallets');
            localStorage.removeItem('tatadana_chat_history');
            window.dispatchEvent(new CustomEvent('tatadana-state-updated', { detail: cleanZeroState }));
        } catch (e) {}

        // 3. Save user session
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        window.updateAccountUI();

        if (typeof window.showTataDanaToast === 'function') {
            if (plan === 'Pro') {
                const nominalStr = (formData.amount) ? ('Rp ' + new Intl.NumberFormat('id-ID').format(formData.amount)) : (formData.duration === '6bulan' ? 'Rp 24.999' : 'Rp 49.999');
                window.showTataDanaToast(`Pendaftaran berhasil! Pembayaran Premium Anda (${nominalStr}) sedang menunggu verifikasi/approval Admin.`, 'info');
            } else {
                window.showTataDanaToast(`Pendaftaran berhasil! Selamat datang ${newUser.name}. Seluruh saldo & transaksi Anda mulai dari Rp0.`, 'success');
            }
        }

        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1200);

        return newUser;
    };

    // 3c. Admin Approve Pro Action (Supports userId, email, and userName)
    window.approveUserPro = async function (identifier, email, name) {
        const payload = {
            userId: identifier,
            email: email || identifier,
            userName: name || identifier
        };
        try {
            const res = await fetch('/api/admin/approve-pro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.ok) {
                // If the approved user happens to be the currently logged-in user, update local session
                const curr = window.getTataDanaUser();
                if (curr && (curr.id === identifier || curr.email === email || curr.email === identifier || curr.name === name)) {
                    curr.plan = 'Pro';
                    curr.paymentStatus = 'Approved';
                    curr.role = 'Pro Quantum';
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(curr));
                    window.updateAccountUI();
                }
                return true;
            }
        } catch (e) {
            try {
                const sRes = await fetch('/api/state');
                const state = await sRes.json();
                if (state.users) {
                    const u = state.users.find(x => x.id === identifier || x.email === email || x.email === identifier || x.name === name);
                    if (u) {
                        u.plan = 'Pro';
                        u.paymentStatus = 'Approved';
                        u.role = 'Pro Quantum';
                        await fetch('/api/state', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(state)
                        });
                        return true;
                    }
                }
            } catch (err) {}
        }
        return false;
    };

    // 3d. Admin Reject Pro Action (Reverts user plan to Gratis)
    window.rejectUserPro = async function (identifier, email, name) {
        const payload = {
            userId: identifier,
            email: email || identifier,
            userName: name || identifier
        };
        try {
            const res = await fetch('/api/admin/reject-pro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.ok) {
                const curr = window.getTataDanaUser();
                if (curr && (curr.id === identifier || curr.email === email || curr.email === identifier || curr.name === name)) {
                    curr.plan = 'Gratis';
                    curr.paymentStatus = 'Ditolak';
                    curr.role = 'Starter';
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(curr));
                    window.updateAccountUI();
                }
                return true;
            }
        } catch (e) {
            try {
                const sRes = await fetch('/api/state');
                const state = await sRes.json();
                if (state.users) {
                    const u = state.users.find(x => x.id === identifier || x.email === email || x.email === identifier || x.name === name);
                    if (u) {
                        u.plan = 'Gratis';
                        u.paymentStatus = 'Ditolak';
                        u.role = 'Starter';
                        await fetch('/api/state', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(state)
                        });
                        return true;
                    }
                }
            } catch (err) {}
        }
        return false;
    };

    // 3e. Synchronize Live User Pro/Approval Status from Server
    window.syncCurrentUserStatus = async function () {
        const curr = window.getTataDanaUser();
        if (!curr || !curr.isLoggedIn || !curr.email) return;

        try {
            let serverUsers = [];
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const d = await res.json();
                    if (d.users) serverUsers = d.users;
                }
            } catch (e) {}

            if (serverUsers.length === 0) {
                const sRes = await fetch('/api/state');
                if (sRes.ok) {
                    const st = await sRes.json();
                    if (st.users) serverUsers = st.users;
                }
            }

            const matched = serverUsers.find(u => u.email && u.email.toLowerCase() === curr.email.toLowerCase());
            if (matched) {
                let statusChanged = false;
                const wasPending = (curr.paymentStatus === 'Pending Approval' || curr.paymentStatus === 'Pending');

                if (curr.plan !== matched.plan || curr.paymentStatus !== matched.paymentStatus || curr.role !== matched.role) {
                    curr.plan = matched.plan;
                    curr.paymentStatus = matched.paymentStatus;
                    curr.role = matched.role || (matched.plan === 'Pro' ? 'Pro Quantum' : 'Starter');
                    statusChanged = true;
                }
                if (matched.paymentAmount && curr.paymentAmount !== matched.paymentAmount) {
                    curr.paymentAmount = matched.paymentAmount;
                    curr.planAmount = matched.paymentAmount;
                    curr.amount = matched.paymentAmount;
                    statusChanged = true;
                }
                if (matched.planDuration && curr.planDuration !== matched.planDuration) {
                    curr.planDuration = matched.planDuration;
                    curr.duration = matched.planDuration;
                    statusChanged = true;
                }
                if (statusChanged) {
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(curr));
                    window.updateAccountUI();
                    window.dispatchEvent(new CustomEvent('tatadana-user-status-synced', { detail: curr }));

                    if (wasPending && matched.paymentStatus === 'Approved') {
                        if (typeof window.showTataDanaToast === 'function') {
                            window.showTataDanaToast('🎉 Pembayaran Pro Anda telah DISETUJUI oleh Admin! Akun Pro Quantum kini aktif.', 'success');
                        }
                    }
                }
            }
        } catch (e) {}
    };

    // 4. Logout Action (Genuinely clears auth state in localStorage)
    window.logoutTataDana = function () {
        try {
            localStorage.removeItem(USER_STORAGE_KEY);
        } catch (e) {}
        window.updateAccountUI();

        if (typeof window.showTataDanaToast === 'function') {
            window.showTataDanaToast('Berhasil keluar dari akun TataDana. Mengalihkan ke Login...', 'info');
        }
        setTimeout(() => {
            window.location.href = '/login';
        }, 400);
    };

    // 5. Toast Notification Fallback
    if (typeof window.showTataDanaToast !== 'function') {
        window.showTataDanaToast = function (message, type = 'success') {
            let container = document.getElementById('tatadana-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'tatadana-toast-container';
                container.className = 'fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = 'pointer-events-auto transform transition-all duration-300 -translate-y-4 opacity-0 flex items-center gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs font-mono font-bold';
            
            if (type === 'error') {
                toast.className += ' bg-slate-950/95 border-red-500/60 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.3)]';
                toast.innerHTML = `<span class="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-sm">✕</span><span class="flex-1">${message}</span>`;
            } else if (type === 'info') {
                toast.className += ' bg-slate-950/95 border-cyan-400/60 text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.3)]';
                toast.innerHTML = `<span class="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-sm">ℹ</span><span class="flex-1">${message}</span>`;
            } else {
                toast.className += ' bg-slate-950/95 border-yellow-400/60 text-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.3)]';
                toast.innerHTML = `<span class="w-6 h-6 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 text-sm">✓</span><span class="flex-1">${message}</span>`;
            }

            container.appendChild(toast);
            requestAnimationFrame(() => {
                toast.classList.remove('-translate-y-4', 'opacity-0');
                toast.classList.add('translate-y-0', 'opacity-100');
            });

            setTimeout(() => {
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('-translate-y-4', 'opacity-0');
                setTimeout(() => {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 300);
            }, 2600);
        };
        window.showToast = window.showTataDanaToast;
    }

    // 6. High-Contrast Easily Visible Cyber Cursor (Custom precision SVG cursor)
    function injectVisibleCursorStyles() {
        const styleId = 'tatadana-visible-cursor-style';
        if (document.getElementById(styleId)) return;

        // Custom High-Contrast Yellow/Black SVG Arrow (hotspot at tip 1,1)
        const arrowSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'%3E%3Cpolygon points='1,1 1,22 6.5,17 11,26 15,24 10.5,15 18,15' fill='%23FFE600' stroke='%23000000' stroke-width='2' stroke-linejoin='round'/%3E%3Cpolygon points='3,4 3,18 7,14.5 11,22.5 13,21.5 9,13.5 14,13.5' fill='%23FFFFFF' opacity='0.45'/%3E%3C/svg%3E";

        // Custom High-Contrast Pointer Hand (hotspot at 8,2)
        const pointerSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'%3E%3Cpath d='M8 2v13.5l-2.5-2.5a2.2 2.2 0 0 0-3.1 3.1l6.8 6.8A7.5 7.5 0 0 0 14.5 25H18a7 7 0 0 0 7-7v-7.5a2 2 0 0 0-2-2 2 2 0 0 0-1.8 1.1A2 2 0 0 0 19.5 8a2 2 0 0 0-1.8.8A2 2 0 0 0 14 7a2 2 0 0 0-2-2V2a2 2 0 0 0-4 0z' fill='%23FFE600' stroke='%23000000' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E";

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* TataDana High-Contrast Ultra-Visible Cyber Cursor */
            * {
                cursor: url("${arrowSvg}") 1 1, default;
            }
            html, body {
                cursor: url("${arrowSvg}") 1 1, default !important;
            }
            a, button, [onclick], input[type="submit"], input[type="button"], select, [role="button"], .cursor-pointer, .cat-card-btn {
                cursor: url("${pointerSvg}") 8 2, pointer !important;
            }
            input[type="text"], input[type="password"], input[type="email"], input[type="number"], input[type="tel"], textarea {
                cursor: text !important;
            }
            /* Suppress lagging or broken custom cursor elements */
            #custom-cursor, #custom-cursor-dot {
                display: none !important;
                visibility: hidden !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 7. Inject Unified Account Modal & Mobile Drawer HTML into DOM
    function injectAccountElements() {
        if (!document.getElementById('tatadanaAccountModal')) {
            const modal = document.createElement('div');
            modal.id = 'tatadanaAccountModal';
            modal.className = 'hidden fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200';
            modal.innerHTML = `
                <div class="cyber-card max-w-md w-full p-6 sm:p-7 rounded-3xl space-y-5 border-2 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.25)] relative text-white animate-in fade-in zoom-in-95 duration-200">
                    <!-- Close button -->
                    <button onclick="closeAccountModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:border-yellow-400 text-slate-400 hover:text-white flex items-center justify-center transition">
                        ✕
                    </button>

                    <!-- Profile Header -->
                    <div class="flex items-center gap-4 pb-4 border-b border-yellow-500/20">
                        <div id="modalUserAvatar" class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)] border border-yellow-200 shrink-0">
                            BP
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <h3 id="modalUserName" class="text-lg font-black text-white truncate">Budi Pratama</h3>
                                <span id="modalUserStatusDot" class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Sesi Aktif"></span>
                            </div>
                            <p id="modalUserEmail" class="text-xs text-slate-400 font-mono truncate">budi@tatadana.id</p>
                            <div class="mt-1 flex items-center gap-2">
                                <span id="modalUserRoleBadge" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                                    PRO QUANTUM
                                </span>
                                <span id="modalLoginStatusBadge" class="text-[10px] font-mono text-emerald-400">● Logged In</span>
                            </div>
                        </div>
                    </div>

                    <!-- Integration Info -->
                    <div class="space-y-3 font-mono text-xs">
                        <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-yellow-500/20 flex items-center justify-between">
                            <div class="flex items-center gap-2.5">
                                <div class="w-7 h-7 rounded-lg bg-[#0088CC]/20 text-[#229ED9] flex items-center justify-center font-bold">
                                    ✈
                                </div>
                                <div>
                                    <p class="font-bold text-white">Bot Telegram</p>
                                    <p class="text-[11px] text-[#229ED9] font-mono">@DANATATA_BOT</p>
                                </div>
                            </div>
                            <a href="https://t.me/DANATATA_BOT" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#0088CC]/30 hover:bg-[#0088CC]/50 text-[#229ED9] text-[10px] font-bold border border-[#229ED9]/40 transition">
                                Buka Bot &rarr;
                            </a>
                        </div>

                        <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-yellow-500/20 space-y-1.5">
                            <div class="flex items-center justify-between">
                                <span class="text-slate-400">Status Sinkronisasi</span>
                                <span class="text-emerald-400 font-bold">● Aktif Real-time</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-400">Tipe Akses Akun</span>
                                <span class="text-yellow-400 font-bold">Fintech Unlimited</span>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="space-y-2 pt-2">
                        <!-- If Logged In -->
                        <div id="modalLoggedInActions" class="space-y-2">
                            <a href="/dashboard" class="w-full py-2.5 px-4 rounded-xl yellow-btn text-xs font-black flex items-center justify-center gap-2 shadow">
                                <span>Terminal Dashboard</span> &rarr;
                            </a>
                            <div class="grid grid-cols-2 gap-2">
                                <a href="/login" class="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-yellow-500/30 text-yellow-400 text-xs font-bold text-center transition">
                                    Beralih Akun
                                </a>
                                <a href="/settings" class="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-yellow-500/30 text-yellow-400 text-xs font-bold text-center transition">
                                    Pengaturan
                                </a>
                            </div>
                            <button onclick="logoutTataDana()" class="w-full py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition">
                                <span>🚪 Keluar / Logout Akun</span>
                            </button>
                        </div>

                        <!-- If Logged Out (Public Mode) -->
                        <div id="modalLoggedOutActions" class="hidden space-y-2.5">
                            <div class="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono text-center">
                                Anda sedang dalam <strong>Mode Publik / Tamu</strong>. Silakan masuk untuk sinkronisasi penuh data Anda.
                            </div>
                            <a href="/login" class="w-full py-3 px-4 rounded-xl yellow-btn text-xs font-black flex items-center justify-center gap-2 shadow">
                                <span>🔑 Masuk ke Akun Anda (Login)</span> &rarr;
                            </a>
                            <button onclick="loginTataDana('budi@tatadana.id', 'Budi Pratama')" class="w-full py-2.5 px-4 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 text-yellow-300 text-xs font-bold flex items-center justify-center gap-1.5 transition">
                                <span>⚡ Masuk Cepat sebagai Budi (Demo)</span>
                            </button>
                            <a href="/register" class="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-yellow-500/30 text-yellow-400 text-xs font-bold text-center block transition">
                                Daftar Akun Baru (Gratis)
                            </a>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) window.closeAccountModal();
            });
        }

        // Mobile Navigation Drawer
        if (!document.getElementById('tatadanaMobileDrawer')) {
            const drawer = document.createElement('div');
            drawer.id = 'tatadanaMobileDrawer';
            drawer.className = 'hidden fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md md:hidden transition-opacity';
            drawer.innerHTML = `
                <div class="w-72 max-w-[85%] h-full bg-slate-950 border-r border-yellow-500/30 flex flex-col justify-between p-5 space-y-6 overflow-y-auto">
                    <div class="space-y-5">
                        <!-- Drawer Header -->
                        <div class="flex items-center justify-between pb-3 border-b border-yellow-500/20">
                            <a href="/" class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-slate-950 font-black">TD</div>
                                <span class="font-black text-white text-lg">TATA<span class="text-yellow-400">DANA</span></span>
                            </a>
                            <button onclick="closeMobileDrawer()" class="p-2 text-slate-400 hover:text-white">✕</button>
                        </div>

                        <!-- User Profile Card in Drawer -->
                        <div onclick="openAccountModal(); closeMobileDrawer();" class="p-3.5 rounded-2xl cyber-card border border-yellow-500/30 flex items-center gap-3 cursor-pointer hover:border-yellow-400 transition">
                            <div id="drawerAvatar" class="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center shrink-0">BP</div>
                            <div class="min-w-0 flex-1">
                                <p id="drawerName" class="text-xs font-bold text-white truncate">Budi Pratama</p>
                                <p id="drawerRole" class="text-[10px] text-yellow-400 font-mono">PRO QUANTUM</p>
                            </div>
                            <span class="text-xs text-yellow-400">&rsaquo;</span>
                        </div>

                        <!-- Nav Links -->
                        <nav class="space-y-1 font-mono text-xs">
                            <a href="/dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-yellow-400/10 hover:text-yellow-400 transition">
                                <span>🏠 Beranda Dashboard</span>
                            </a>
                            <a href="/laporan" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-yellow-400/10 hover:text-yellow-400 transition">
                                <span>📊 Laporan & Export</span>
                            </a>
                            <a href="/budget" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-yellow-400/10 hover:text-yellow-400 transition">
                                <span>🎯 Budgeting</span>
                            </a>
                            <a href="/wallet" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-yellow-400/10 hover:text-yellow-400 transition">
                                <span>👛 Dompet / Wallet</span>
                            </a>
                            <a href="/settings" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-yellow-400/10 hover:text-yellow-400 transition">
                                <span>🤖 Bot Telegram & Setup</span>
                            </a>
                        </nav>
                    </div>

                    <!-- Drawer Footer Actions -->
                    <div class="pt-4 border-t border-yellow-500/20 space-y-2">
                        <button onclick="openAccountModal(); closeMobileDrawer();" class="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-yellow-500/30 text-yellow-400 text-xs font-bold text-center block transition">
                            👤 Menu Akun & Profil
                        </button>
                        <div id="drawerAuthBtnContainer">
                            <!-- Populated dynamically by updateAccountUI -->
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(drawer);

            drawer.addEventListener('click', (e) => {
                if (e.target === drawer) window.closeMobileDrawer();
            });
        }

        // Pro Payment Modal (Rekening Bank Admin TataDana: BCA, Mandiri, QRIS)
        if (!document.getElementById('tatadanaProPaymentModal')) {
            const payModal = document.createElement('div');
            payModal.id = 'tatadanaProPaymentModal';
            payModal.className = 'hidden fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto';
            payModal.innerHTML = `
                <div class="cyber-card max-w-lg w-full p-5 sm:p-7 rounded-3xl space-y-4 border-2 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.3)] relative text-white my-auto max-h-[92vh] overflow-y-auto">
                    <!-- Close button -->
                    <button onclick="closeProPaymentModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:border-yellow-400 text-slate-400 hover:text-white flex items-center justify-center transition">
                        ✕
                    </button>

                    <!-- Header -->
                    <div class="flex items-center gap-3 pb-3 border-b border-yellow-500/20">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)] shrink-0">
                            💎
                        </div>
                        <div>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 uppercase">
                                TATADANA PREMIUM
                            </span>
                            <h3 class="text-lg font-black text-white mt-0.5">Pembayaran Akun Premium TataDana</h3>
                            <p class="text-[11px] text-slate-400 font-mono">Pilih paket, transfer ke rekening resmi & konfirmasi untuk aktivasi</p>
                        </div>
                    </div>

                    <!-- Pilihan Paket Durasi Premium -->
                    <div>
                        <label class="block text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1.5 font-mono">
                            Pilih Paket Berlangganan:
                        </label>
                        <div class="grid grid-cols-2 gap-2 font-mono text-xs">
                            <label id="proPlanLabel6mo" onclick="selectModalProPlan('6bulan')" class="p-2.5 rounded-xl border border-yellow-500/30 bg-slate-900 cursor-pointer flex items-center justify-between hover:border-yellow-400 transition">
                                <div>
                                    <span class="font-bold text-white text-xs block">6 Bulan</span>
                                    <span class="text-yellow-400 font-bold text-[11px]">Rp 24.999</span>
                                </div>
                                <input type="radio" name="modalProPlan" id="modalRadio6mo" value="6bulan" class="accent-yellow-400" />
                            </label>

                            <label id="proPlanLabelLifetime" onclick="selectModalProPlan('lifetime')" class="p-2.5 rounded-xl border-2 border-yellow-400 bg-yellow-400/10 cursor-pointer flex items-center justify-between shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                                <div>
                                    <span class="font-bold text-white text-xs block">Lifetime 👑</span>
                                    <span class="text-yellow-400 font-black text-[11px]">Rp 49.999</span>
                                </div>
                                <input type="radio" name="modalProPlan" id="modalRadioLifetime" value="lifetime" checked class="accent-yellow-400" />
                            </label>
                        </div>
                    </div>

                    <!-- Nominal Highlight Box -->
                    <div class="p-3.5 rounded-2xl bg-yellow-400/10 border-2 border-yellow-400/60 flex items-center justify-between">
                        <div>
                            <span class="text-[10px] font-mono text-yellow-300 font-bold uppercase tracking-wider">Total Transfer Paket Terpilih</span>
                            <p class="text-2xl font-black text-yellow-400 font-mono" id="proPaymentNominalText">Rp 49.999</p>
                            <span class="text-[10px] text-slate-400 font-mono" id="proPaymentSubText">Akses selamanya tanpa batas &bull; Approval admin instan</span>
                        </div>
                        <button type="button" id="btnCopyNominal" onclick="copyProPaymentNominal()" class="px-3 py-2 rounded-xl bg-yellow-400 text-slate-950 font-bold text-xs font-mono hover:bg-yellow-300 transition shadow">
                            📋 Salin
                        </button>
                    </div>

                    <!-- Admin Bank Accounts Box -->
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-yellow-400 uppercase tracking-wider font-mono">
                            Rekening Resmi Admin TataDana
                        </label>
                        <div class="space-y-2 text-xs font-mono">
                            <!-- BCA -->
                            <div class="p-3 rounded-xl bg-slate-950/80 border border-yellow-500/30 flex items-center justify-between">
                                <div class="space-y-0.5">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded bg-[#0066AE]/20 text-[#0066AE] font-black text-[10px]">BANK BCA</span>
                                        <span class="text-white font-bold tracking-wider">8830-1913-205</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400">a.n. <strong class="text-slate-200">Rizky M. Riady (TataDana)</strong></p>
                                </div>
                                <button type="button" onclick="navigator.clipboard.writeText('88301913205'); window.showTataDanaToast('No. Rekening BCA berhasil disalin!', 'success');" class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-400 hover:text-slate-950 font-bold text-[11px] transition">
                                    Salin
                                </button>
                            </div>

                            <!-- Mandiri -->
                            <div class="p-3 rounded-xl bg-slate-950/80 border border-yellow-500/30 flex items-center justify-between">
                                <div class="space-y-0.5">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded bg-[#003D79]/20 text-cyan-400 font-black text-[10px]">BANK MANDIRI</span>
                                        <span class="text-white font-bold tracking-wider">132-00-1913205-1</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400">a.n. <strong class="text-slate-200">Rizky M. Riady</strong></p>
                                </div>
                                <button type="button" onclick="navigator.clipboard.writeText('1320019132051'); window.showTataDanaToast('No. Rekening Mandiri berhasil disalin!', 'success');" class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-400 hover:text-slate-950 font-bold text-[11px] transition">
                                    Salin
                                </button>
                            </div>

                            <!-- QRIS / E-Wallet -->
                            <div class="p-3 rounded-xl bg-slate-950/80 border border-yellow-500/30 flex items-center justify-between">
                                <div class="space-y-0.5">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px]">QRIS / GOPAY / DANA</span>
                                        <span class="text-white font-bold tracking-wider">0812-1913-2050</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400">a.n. <strong class="text-slate-200">Rizky M. Riady</strong> (All E-Wallet / QRIS)</p>
                                </div>
                                <button type="button" onclick="navigator.clipboard.writeText('081219132050'); window.showTataDanaToast('No. E-Wallet berhasil disalin!', 'success');" class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-400 hover:text-slate-950 font-bold text-[11px] transition">
                                    Salin
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Confirmation Form -->
                    <form onsubmit="handleProPaymentSubmit(event)" class="space-y-3 pt-1">
                        <div>
                            <label class="block text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1 font-mono">
                                Metode Pembayaran Yang Anda Gunakan
                            </label>
                            <select id="proPayMethodSelect" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-yellow-500/30 text-white font-mono text-xs focus:outline-none focus:border-yellow-400">
                                <option value="BCA Transfer">BCA Transfer (8830-1913-205)</option>
                                <option value="Bank Mandiri">Bank Mandiri (132-00-1913205-1)</option>
                                <option value="QRIS / GoPay / Dana">QRIS / GoPay / Dana (0812-1913-2050)</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                                    Nama Pemilik Rekening
                                </label>
                                <input id="proSenderNameInput" type="text" required placeholder="Nama di rekening Anda" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-yellow-500/30 text-white font-mono text-xs focus:outline-none focus:border-yellow-400" />
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                                    No. Rekening / No. HP
                                </label>
                                <input id="proSenderAccountInput" type="text" required placeholder="Nomor rekening pengirim" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-yellow-500/30 text-white font-mono text-xs focus:outline-none focus:border-yellow-400" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                                Bukti Transfer / Struk Pembayaran
                            </label>
                            <div class="flex items-center gap-2">
                                <input id="proProofFileInput" type="file" accept="image/*" class="w-full text-xs font-mono text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-slate-950 hover:file:bg-yellow-300 cursor-pointer" onchange="previewProofImage(event)" />
                            </div>
                            <div id="proofPreviewContainer" class="hidden mt-2 p-2 rounded-xl bg-slate-950 border border-yellow-500/30 flex items-center gap-2 text-xs font-mono text-emerald-400">
                                <span>✓ Bukti struk terlampir & siap diverifikasi admin</span>
                            </div>
                        </div>

                        <button type="submit" id="btnSubmitProPay" class="yellow-btn w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider mt-2 shadow-lg flex items-center justify-center gap-2">
                            <span>🚀 Konfirmasi Pembayaran & Kirim ke Admin</span>
                        </button>
                    </form>
                </div>
            `;
            document.body.appendChild(payModal);

            payModal.addEventListener('click', (e) => {
                if (e.target === payModal) closeProPaymentModal();
            });
        }
    }

    // Modal Pro Plan Selector & Copy Helpers
    window._selectedModalProPlan = 'lifetime';
    window.selectModalProPlan = function (type) {
        window._selectedModalProPlan = type;
        const r6 = document.getElementById('modalRadio6mo');
        const rLife = document.getElementById('modalRadioLifetime');
        const l6 = document.getElementById('proPlanLabel6mo');
        const lLife = document.getElementById('proPlanLabelLifetime');
        const nomText = document.getElementById('proPaymentNominalText');
        const subText = document.getElementById('proPaymentSubText');

        if (type === '6bulan') {
            if (r6) r6.checked = true;
            if (rLife) rLife.checked = false;
            if (l6) l6.className = 'p-2.5 rounded-xl border-2 border-yellow-400 bg-yellow-400/10 cursor-pointer flex items-center justify-between shadow-[0_0_15px_rgba(250,204,21,0.2)] transition';
            if (lLife) lLife.className = 'p-2.5 rounded-xl border border-yellow-500/30 bg-slate-900 cursor-pointer flex items-center justify-between hover:border-yellow-400 transition';
            if (nomText) nomText.textContent = 'Rp 24.999';
            if (subText) subText.innerHTML = 'Masa aktif 6 bulan &bull; Approval admin instan';
        } else {
            if (rLife) rLife.checked = true;
            if (r6) r6.checked = false;
            if (lLife) lLife.className = 'p-2.5 rounded-xl border-2 border-yellow-400 bg-yellow-400/10 cursor-pointer flex items-center justify-between shadow-[0_0_15px_rgba(250,204,21,0.2)] transition';
            if (l6) l6.className = 'p-2.5 rounded-xl border border-yellow-500/30 bg-slate-900 cursor-pointer flex items-center justify-between hover:border-yellow-400 transition';
            if (nomText) nomText.textContent = 'Rp 49.999';
            if (subText) subText.innerHTML = 'Akses selamanya tanpa batas &bull; Approval admin instan';
        }
    };

    window.copyProPaymentNominal = function () {
        const plan = window._selectedModalProPlan || 'lifetime';
        const nominal = plan === '6bulan' ? '24999' : '49999';
        navigator.clipboard.writeText(nominal);
        if (typeof window.showTataDanaToast === 'function') {
            window.showTataDanaToast(`Nominal transfer (Rp ${plan === '6bulan' ? '24.999' : '49.999'}) berhasil disalin!`, 'success');
        }
    };

    // Global Premium Checker
    window.isTataDanaPremium = function () {
        const user = window.getTataDanaUser();
        if (!user || !user.isLoggedIn) return false;
        if (user.role === 'Superadmin' || user.role === 'Pro Quantum') return true;
        if (user.plan === 'Pro' && user.paymentStatus !== 'Pending Approval' && user.paymentStatus !== 'Ditolak') return true;
        return false;
    };

    // Global Premium Upgrade Upsell Modal
    window.showPremiumFeatureModal = function (title, description) {
        let modal = document.getElementById('tatadanaPremiumFeatureModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tatadanaPremiumFeatureModal';
            modal.className = 'fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md';
            modal.innerHTML = `
                <div class="cyber-card max-w-md w-full p-6 sm:p-7 rounded-3xl border-2 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.35)] relative text-white space-y-4">
                    <button onclick="document.getElementById('tatadanaPremiumFeatureModal').classList.add('hidden')" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:border-yellow-400 text-slate-400 hover:text-white flex items-center justify-center transition">✕</button>
                    
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shrink-0">
                            ⭐
                        </div>
                        <div>
                            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 uppercase">Eksklusif Premium</span>
                            <h3 id="premModalTitle" class="text-base font-black text-white mt-0.5">Fitur Khusus Paket Premium</h3>
                        </div>
                    </div>

                    <p id="premModalDesc" class="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-yellow-500/20">
                        Fitur ini hanya dapat diakses oleh pengguna paket Premium TataDana.
                    </p>

                    <div class="grid grid-cols-2 gap-2.5 pt-1 font-mono text-xs">
                        <div class="p-3 rounded-xl bg-slate-900 border border-yellow-500/30 text-center space-y-1">
                            <span class="text-[10px] text-slate-400 block uppercase">Paket 6 Bulan</span>
                            <span class="text-base font-black text-yellow-400 block">Rp 24.999</span>
                            <span class="text-[9px] text-slate-400 block">Hemat & terjangkau</span>
                        </div>
                        <div class="p-3 rounded-xl bg-yellow-400/10 border-2 border-yellow-400 text-center space-y-1 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                            <span class="text-[10px] text-yellow-300 font-bold block uppercase">Lifetime 👑</span>
                            <span class="text-base font-black text-yellow-400 block">Rp 49.999</span>
                            <span class="text-[9px] text-slate-300 block">Akses seumur hidup</span>
                        </div>
                    </div>

                    <div class="space-y-2 pt-2">
                        <button onclick="document.getElementById('tatadanaPremiumFeatureModal').classList.add('hidden'); window.openProPaymentModal();" class="yellow-btn w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg">
                            <span>💎 Upgrade ke Premium Sekarang</span>
                        </button>
                        <button onclick="document.getElementById('tatadanaPremiumFeatureModal').classList.add('hidden')" class="w-full py-2 text-center text-xs font-mono text-slate-400 hover:text-white transition">
                            Nanti Saja
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        }

        const tEl = document.getElementById('premModalTitle');
        const dEl = document.getElementById('premModalDesc');
        if (tEl && title) tEl.textContent = title;
        if (dEl && description) dEl.textContent = description;
        modal.classList.remove('hidden');
    };

    // Daily Transaction Limit Checker (Free starter: 25 transactions/day)
    window.checkDailyTransactionLimit = function (state) {
        if (window.isTataDanaPremium && window.isTataDanaPremium()) {
            return { allowed: true, count: 0, limit: Infinity };
        }
        const s = state || (typeof window.getTataDanaState === 'function' ? window.getTataDanaState() : null);
        const txList = (s && s.transactions) ? s.transactions : [];
        const today = new Date().toISOString().split('T')[0];
        const count = txList.filter(t => t.date && t.date.startsWith(today)).length;
        if (count >= 25) {
            return {
                allowed: false,
                count: count,
                limit: 25,
                message: 'Batas harian 25 transaksi untuk paket Free telah tercapai hari ini (25/25).'
            };
        }
        return {
            allowed: true,
            count: count,
            limit: 25
        };
    };

    // 8. Open / Close Modal & Drawer
    window.openAccountModal = function () {
        injectAccountElements();
        window.updateAccountUI();
        const modal = document.getElementById('tatadanaAccountModal');
        if (modal) modal.classList.remove('hidden');
    };

    window.closeAccountModal = function () {
        const modal = document.getElementById('tatadanaAccountModal');
        if (modal) modal.classList.add('hidden');
    };

    window.openProPaymentModal = function () {
        injectAccountElements();
        const modal = document.getElementById('tatadanaProPaymentModal');
        if (modal) {
            const user = window.getTataDanaUser();
            const senderNameInput = document.getElementById('proSenderNameInput');
            const senderAccInput = document.getElementById('proSenderAccountInput');
            if (senderNameInput && user && user.name && user.name !== 'Tamu / Belum Masuk') {
                if (!senderNameInput.value) senderNameInput.value = user.name;
            }
            if (senderAccInput && user && user.phone) {
                if (!senderAccInput.value) senderAccInput.value = user.phone;
            }
            window.selectModalProPlan(window._selectedModalProPlan || 'lifetime');
            modal.classList.remove('hidden');
        }
    };

    window.closeProPaymentModal = function () {
        const modal = document.getElementById('tatadanaProPaymentModal');
        if (modal) modal.classList.add('hidden');
    };

    window.previewProofImage = function (e) {
        const file = e.target.files && e.target.files[0];
        const preview = document.getElementById('proofPreviewContainer');
        if (file && preview) {
            preview.classList.remove('hidden');
            preview.innerHTML = `<span>✓ Struk terlampir: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)</span>`;
        }
    };

    window.handleProPaymentSubmit = async function (e) {
        e.preventDefault();
        const user = window.getTataDanaUser();
        if (!user || !user.isLoggedIn || !user.email) {
            window.showTataDanaToast('Silakan login terlebih dahulu untuk melakukan pembayaran Pro.', 'error');
            setTimeout(() => { window.location.href = '/login'; }, 1000);
            return;
        }

        const method = document.getElementById('proPayMethodSelect').value;
        const senderName = document.getElementById('proSenderNameInput').value.trim();
        const senderAccount = document.getElementById('proSenderAccountInput').value.trim();
        const fileInput = document.getElementById('proProofFileInput');
        const proofName = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : 'struk_transfer.png';

        const plan = window._selectedModalProPlan || 'lifetime';
        const amount = plan === '6bulan' ? 24999 : 49999;
        const durationText = plan === '6bulan' ? '6 Bulan' : 'Lifetime';

        const btn = document.getElementById('btnSubmitProPay');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = 'Mengirim Bukti Pembayaran...';
        }

        try {
            await fetch('/api/user/upgrade-pro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    userId: user.id,
                    name: user.name,
                    phone: user.phone,
                    paymentMethod: method,
                    senderName: senderName,
                    senderAccount: senderAccount,
                    proofImage: proofName,
                    amount: amount,
                    paymentAmount: amount,
                    planAmount: amount,
                    duration: plan,
                    planDuration: plan,
                    durationText: durationText
                })
            });
        } catch (err) {}

        // Update local session
        user.plan = 'Pro';
        user.planDuration = plan;
        user.duration = plan;
        user.durationLabel = durationText;
        user.amount = amount;
        user.paymentAmount = amount;
        user.planAmount = amount;
        user.paymentStatus = 'Pending Approval';
        user.paymentMethod = method;
        user.senderName = senderName;
        user.senderAccount = senderAccount;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        window.updateAccountUI();
        window.dispatchEvent(new CustomEvent('tatadana-user-status-synced', { detail: user }));

        window.closeProPaymentModal();
        window.showTataDanaToast(`✓ Bukti transfer (${durationText} - Rp ${new Intl.NumberFormat('id-ID').format(amount)}) terkirim! Status: Menunggu Approval Admin.`, 'success');

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>🚀 Konfirmasi Pembayaran & Kirim ke Admin</span>';
        }

        // Start background poll every 3 seconds to check when admin approves
        if (!window._proApprovalPollInterval) {
            window._proApprovalPollInterval = setInterval(async () => {
                const u = window.getTataDanaUser();
                if (!u || u.paymentStatus === 'Approved') {
                    clearInterval(window._proApprovalPollInterval);
                    window._proApprovalPollInterval = null;
                    return;
                }
                await window.syncCurrentUserStatus();
            }, 3000);
        }
    };

    window.toggleAccountModal = function () {
        const modal = document.getElementById('tatadanaAccountModal');
        if (modal && !modal.classList.contains('hidden')) {
            window.closeAccountModal();
        } else {
            window.openAccountModal();
        }
    };

    window.openMobileDrawer = function () {
        injectAccountElements();
        window.updateAccountUI();
        const drawer = document.getElementById('tatadanaMobileDrawer');
        if (drawer) drawer.classList.remove('hidden');
    };

    window.closeMobileDrawer = function () {
        const drawer = document.getElementById('tatadanaMobileDrawer');
        if (drawer) drawer.classList.add('hidden');
    };

    window.toggleMobileDrawer = function () {
        const drawer = document.getElementById('tatadanaMobileDrawer');
        if (drawer && !drawer.classList.contains('hidden')) {
            window.closeMobileDrawer();
        } else {
            window.openMobileDrawer();
        }
    };

    // 9. Synchronize UI Elements Across All Pages
    window.updateAccountUI = function () {
        const user = window.getTataDanaUser();
        const isLoggedIn = user && user.isLoggedIn === true;

        // Modal Elements
        const modalAvatar = document.getElementById('modalUserAvatar');
        const modalName = document.getElementById('modalUserName');
        const modalEmail = document.getElementById('modalUserEmail');
        const modalRoleBadge = document.getElementById('modalUserRoleBadge');
        const modalStatusDot = document.getElementById('modalUserStatusDot');
        const modalLoginStatus = document.getElementById('modalLoginStatusBadge');
        const modalLoggedInActions = document.getElementById('modalLoggedInActions');
        const modalLoggedOutActions = document.getElementById('modalLoggedOutActions');

        if (modalName) modalName.textContent = isLoggedIn ? user.name : 'Tamu / Belum Masuk';
        if (modalEmail) modalEmail.textContent = isLoggedIn ? user.email : 'Mode Publik (Belum Login)';
        if (modalAvatar) modalAvatar.textContent = isLoggedIn ? (user.avatar || 'BP') : '👤';
        if (modalRoleBadge) modalRoleBadge.textContent = isLoggedIn ? (user.role || 'PRO QUANTUM') : 'MODE PUBLIK';

        if (modalStatusDot) {
            modalStatusDot.className = isLoggedIn ? 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse' : 'w-2.5 h-2.5 rounded-full bg-slate-500';
            modalStatusDot.title = isLoggedIn ? 'Sesi Aktif' : 'Belum Masuk';
        }
        if (modalLoginStatus) {
            modalLoginStatus.textContent = isLoggedIn ? '● Logged In' : '○ Logged Out';
            modalLoginStatus.className = isLoggedIn ? 'text-[10px] font-mono text-emerald-400' : 'text-[10px] font-mono text-slate-500';
        }

        if (modalLoggedInActions && modalLoggedOutActions) {
            if (isLoggedIn) {
                modalLoggedInActions.classList.remove('hidden');
                modalLoggedOutActions.classList.add('hidden');
            } else {
                modalLoggedInActions.classList.add('hidden');
                modalLoggedOutActions.classList.remove('hidden');
            }
        }

        // Landing Page (index.html) Topbar
        const navLoginBtn = document.getElementById('navLoginBtn');
        const navAccountBtn = document.getElementById('navAccountBtn');
        const navAccountLabel = document.getElementById('navAccountLabel');

        if (navAccountLabel) {
            navAccountLabel.textContent = isLoggedIn ? (user.name ? user.name.split(' ')[0] : 'Akun') : 'Akun';
        }
        if (navAccountBtn) {
            navAccountBtn.title = isLoggedIn ? `Akun Saya: ${user.name}` : 'Menu Akun & Login';
        }
        if (navLoginBtn) {
            if (isLoggedIn) {
                // If logged in on landing page, show link to dashboard
                navLoginBtn.href = '/dashboard';
                navLoginBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Masuk Dashboard &rarr;</span>`;
                navLoginBtn.className = 'px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-yellow-400 bg-slate-900 border border-yellow-500/40 hover:bg-slate-800 transition inline-flex items-center gap-1.5 shadow-sm';
            } else {
                // If logged out, clearly show Masuk / Login button
                navLoginBtn.href = '/login';
                navLoginBtn.innerHTML = `<span>🔑 Masuk / Login</span>`;
                navLoginBtn.className = 'px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-yellow-400 hover:bg-slate-900 border border-slate-700/60 transition inline-flex items-center gap-1.5 shadow-sm';
            }
        }

        // Topbar Account Button across Dashboard, Transaksi, Budget, Wallet, Laporan, Settings, Admin
        const topbarAccountBtns = document.querySelectorAll('#topbarAccountBtn, .topbar-account-btn, [data-tatadana-account-topbar]');
        topbarAccountBtns.forEach(btn => {
            if (isLoggedIn) {
                btn.innerHTML = `
                    <div class="w-6 h-6 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-[11px] shadow-sm">${user.avatar || 'BP'}</div>
                    <div class="flex flex-col text-left">
                        <span class="font-bold text-white text-[11px] leading-tight">${user.name}</span>
                        <span class="text-[9px] text-yellow-400 font-mono">${user.role || 'Pro Quantum'}</span>
                    </div>
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-yellow-400 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                `;
                btn.title = `Akun Aktif: ${user.name} (Klik untuk opsi / logout)`;
            } else {
                btn.innerHTML = `
                    <div class="w-6 h-6 rounded-lg bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 flex items-center justify-center font-bold text-[11px]">👤</div>
                    <div class="flex flex-col text-left">
                        <span class="font-bold text-yellow-400 text-[11px] leading-tight">Masuk / Akun</span>
                        <span class="text-[9px] text-slate-400 font-mono">Mode Publik</span>
                    </div>
                    <a href="/login" onclick="event.stopPropagation();" class="ml-1 px-2.5 py-1 rounded-lg bg-yellow-400 text-slate-950 text-[10px] font-black uppercase shadow hover:bg-yellow-300 transition">Login</a>
                `;
                btn.title = 'Mode Publik / Tamu (Klik untuk Masuk / Login)';
            }
        });

        // Mobile Topbar buttons (< md)
        const mobileAccountBtns = document.querySelectorAll('.md\\:hidden button[onclick*="openAccountModal"]');
        mobileAccountBtns.forEach(btn => {
            if (isLoggedIn) {
                btn.innerHTML = `<span>👤 ${(user.name ? user.name.split(' ')[0] : 'Akun')}</span><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>`;
                btn.title = `Akun: ${user.name}`;
            } else {
                btn.innerHTML = `<span>🔑 Masuk / Login</span>`;
                btn.title = 'Masuk / Login ke Akun';
            }
        });

        // Sidebar User Profile Card across Dashboard, Transaksi, Budget, Wallet, Laporan, Settings
        const sidebarUserCards = document.querySelectorAll('#sidebarUserCard, .sidebar-user-card, [data-tatadana-sidebar-user]');
        sidebarUserCards.forEach(card => {
            if (isLoggedIn) {
                card.innerHTML = `
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-lg bg-yellow-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-sm">${user.avatar || 'BP'}</div>
                        <div class="min-w-0">
                            <p class="font-bold text-white text-xs leading-none truncate">${user.name}</p>
                            <span class="text-[9px] text-yellow-400 font-mono">${user.role || 'PRO QUANTUM'}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span class="text-xs text-yellow-400">&rsaquo;</span>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center shrink-0 text-xs">👤</div>
                        <div class="min-w-0">
                            <p class="font-bold text-slate-300 text-xs leading-none truncate">Tamu / Belum Masuk</p>
                            <span class="text-[9px] text-yellow-400 font-mono">Mode Publik</span>
                        </div>
                    </div>
                    <a href="/login" onclick="event.stopPropagation();" class="px-2.5 py-1 rounded-lg bg-yellow-400 text-slate-950 font-black text-[10px] hover:bg-yellow-300 transition shrink-0 shadow">Login &rarr;</a>
                `;
            }
        });

        // Drawer elements
        const drawerName = document.getElementById('drawerName');
        const drawerRole = document.getElementById('drawerRole');
        const drawerAvatar = document.getElementById('drawerAvatar');
        const drawerAuthBtnContainer = document.getElementById('drawerAuthBtnContainer');

        if (drawerName) drawerName.textContent = isLoggedIn ? user.name : 'Tamu / Belum Masuk';
        if (drawerRole) drawerRole.textContent = isLoggedIn ? (user.role || 'PRO QUANTUM') : 'MODE PUBLIK';
        if (drawerAvatar) drawerAvatar.textContent = isLoggedIn ? (user.avatar || 'BP') : '👤';

        if (drawerAuthBtnContainer) {
            if (isLoggedIn) {
                drawerAuthBtnContainer.innerHTML = `
                    <button onclick="logoutTataDana()" class="w-full py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 text-xs font-bold text-center block transition">
                        🚪 Keluar / Logout Akun
                    </button>
                `;
            } else {
                drawerAuthBtnContainer.innerHTML = `
                    <a href="/login" class="w-full py-2.5 px-3 rounded-xl yellow-btn text-xs font-black text-center block shadow">
                        🔑 Masuk / Login ke Akun
                    </a>
                `;
            }
        }
    };

    // 10. Auto-initialize on load
    function init() {
        injectVisibleCursorStyles();
        injectAccountElements();
        window.updateAccountUI();
        if (typeof window.syncCurrentUserStatus === 'function') {
            window.syncCurrentUserStatus();
        }
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

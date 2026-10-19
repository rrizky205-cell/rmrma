/**
 * TataDana Unified Quantum AI Bot Component
 * Available across all pages (Dashboard, Laporan, Budget, Wallet, Settings)
 * Supports: Pengeluaran, Pemasukan, and Transfer Antar Dompet
 * Dynamic category syncing with Budgeting (e.g. "ngopi")
 * Telegram Bot Webhook Synchronization
 */

(function () {
    const STORAGE_KEY = 'tatadana_state_v2';
    window._tatadanaActiveTxType = null;

    // 1. Unified State Access
    window.getTataDanaState = function () {
        let s = localStorage.getItem(STORAGE_KEY);
        if (!s) {
            const defState = {
                wallets: [
                    { id: 'w1', name: 'BCA', balance: 0, type: 'bank', color: '#0066AE', isDefault: true },
                    { id: 'w2', name: 'Mandiri', balance: 0, type: 'bank', color: '#003D79', isDefault: false },
                    { id: 'w3', name: 'GoPay', balance: 0, type: 'ewallet', color: '#00AED6', isDefault: false },
                    { id: 'w4', name: 'Cash', balance: 0, type: 'cash', color: '#10B981', isDefault: false }
                ],
                budgets: [],
                customCategories: [],
                chatHistory: [],
                transactions: []
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defState));
            return defState;
        }
        try {
            const parsed = JSON.parse(s);
            if (!parsed.customCategories) parsed.customCategories = [];
            if (!parsed.budgets) parsed.budgets = [];
            if (!parsed.wallets) parsed.wallets = [];
            if (!parsed.chatHistory) parsed.chatHistory = [];
            if (!parsed.transactions) parsed.transactions = [];
            
            // Purge legacy sample transactions if present
            if (parsed.transactions.some(t => t.id && t.id.startsWith('tx_init_'))) {
                parsed.transactions = parsed.transactions.filter(t => !t.id.startsWith('tx_init_'));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }
            return parsed;
        } catch (e) {
            return { wallets: [], budgets: [], customCategories: [], chatHistory: [], transactions: [] };
        }
    };

    // Global Toast Notification (Replaces intrusive blocking alert)
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

    // Live Thousand Separator Helper (e.g. typing 1000000 automatically turns into 1.000.000)
    window.attachThousandSeparator = function (input) {
        if (!input || input._hasThousandSep) return;
        input._hasThousandSep = true;

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace') {
                const selStart = input.selectionStart;
                const selEnd = input.selectionEnd;
                if (selStart === selEnd && selStart > 0) {
                    const charBefore = input.value[selStart - 1];
                    if (charBefore === '.' || charBefore === ',') {
                        e.preventDefault();
                        const val = input.value;
                        const newVal = val.slice(0, selStart - 2) + val.slice(selStart);
                        input.value = newVal;
                        input.dispatchEvent(new Event('input'));
                        try {
                            input.setSelectionRange(selStart - 1, selStart - 1);
                        } catch (err) {}
                    }
                }
            }
        });

        function updateVal() {
            const curPos = input.selectionStart || 0;
            const oldLen = input.value.length;
            const raw = input.value.replace(/\D/g, '');
            if (!raw) {
                input.value = '';
                return;
            }
            const formatted = new Intl.NumberFormat('id-ID').format(raw);
            input.value = formatted;
            const newLen = formatted.length;
            const newPos = Math.max(0, curPos + (newLen - oldLen));
            try {
                input.setSelectionRange(newPos, newPos);
            } catch (e) {}
        }

        input.addEventListener('input', updateVal);
        if (input.value) updateVal();
    };

    window.parseFormattedNominal = function (val) {
        if (!val) return 0;
        const cleaned = String(val).replace(/\D/g, '');
        const num = parseInt(cleaned, 10);
        return isNaN(num) ? 0 : num;
    };

    window.initCurrencyInputs = function () {
        const selectors = [
            '#formAmount',
            '#customBudgetLimit',
            '#editBudgetLimit',
            '#manualAmount',
            '#manualTxAmount',
            'input[data-currency="true"]',
            'input[data-type="currency"]',
            '.currency-input'
        ];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => window.attachThousandSeparator(el));
        });
        document.querySelectorAll('input[id^="initBal_"]').forEach(el => window.attachThousandSeparator(el));
    };

    // Global Delete Transaction Handler with automatic financial reversal
    window.deleteTransaction = function (txId) {
        if (!txId) return;
        const state = window.getTataDanaState();
        const txIndex = (state.transactions || []).findIndex(t => t.id === txId);
        if (txIndex === -1) return;

        const tx = state.transactions[txIndex];

        // 1. Reverse financial impact on corresponding wallets
        if (state.wallets && state.wallets.length > 0) {
            if (tx.type === 'expense') {
                const w = state.wallets.find(item => item.id === tx.walletId || item.name === tx.walletName) || state.wallets[0];
                if (w) w.balance += tx.amount;
            } else if (tx.type === 'income') {
                const w = state.wallets.find(item => item.id === tx.walletId || item.name === tx.walletName) || state.wallets[0];
                if (w) w.balance -= tx.amount;
            } else if (tx.type === 'transfer') {
                const srcW = state.wallets.find(item => item.id === tx.walletId || item.name === tx.walletName);
                const tgtW = state.wallets.find(item => item.id === tx.targetWalletId || item.name === tx.targetWalletName);
                if (srcW) srcW.balance += tx.amount;
                if (tgtW) tgtW.balance -= tx.amount;
            }
        }

        // 2. Remove transaction from list and record in deletedTxIds
        state.transactions.splice(txIndex, 1);
        if (!state.deletedTxIds) state.deletedTxIds = [];
        if (!state.deletedTxIds.includes(txId)) state.deletedTxIds.push(txId);

        // 3. Save state (triggers reactive re-renders across all pages)
        window.saveTataDanaState(state);

        // 4. Send delete request to backend API
        fetch('/api/transaction/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: txId })
        }).catch(() => {});

        // 5. Non-blocking cyber toast notification
        if (window.showToast) {
            window.showToast(`✓ Transaksi "${tx.category || tx.note || 'Transaksi'}" berhasil dihapus & saldo dikembalikan.`, 'info');
        }
    };

    window.saveTataDanaState = async function (state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        window.dispatchEvent(new CustomEvent('tatadana-state-updated', { detail: state }));
        
        // Trigger local view updates if page handlers exist
        if (typeof window.renderDashboard === 'function') window.renderDashboard();
        if (typeof window.renderBudgets === 'function') window.renderBudgets();
        if (typeof window.renderWallets === 'function') window.renderWallets();
        if (typeof window.renderLaporan === 'function') window.renderLaporan();
        if (typeof window.renderTransaksiList === 'function') window.renderTransaksiList();
        if (typeof window.updateFormCategories === 'function') {
            window.updateFormCategories(window.currentFormType || 'expense');
        }

        // Sync with backend API safely without resurrecting deleted transactions
        try {
            const res = await fetch('/api/state');
            if (res.ok) {
                const serverState = await res.json();
                if (serverState) {
                    if (serverState.telegramToken && !state.telegramToken) {
                        state.telegramToken = serverState.telegramToken;
                    }
                    if (serverState.telegramBotUsername && !state.telegramBotUsername) {
                        state.telegramBotUsername = serverState.telegramBotUsername;
                    }
                    if (serverState.telegramChatId && !state.telegramChatId) {
                        state.telegramChatId = serverState.telegramChatId;
                    }

                    if (Array.isArray(serverState.transactions)) {
                        const deletedTxSet = new Set(state.deletedTxIds || []);
                        const localTxIds = new Set((state.transactions || []).map(t => t.id));
                        const serverOnlyTxs = serverState.transactions.filter(t => !localTxIds.has(t.id) && !deletedTxSet.has(t.id));
                        if (serverOnlyTxs.length > 0) {
                            state.transactions = [...serverOnlyTxs, ...state.transactions];
                        }

                        const localChatIds = new Set((state.chatHistory || []).map(c => c.id));
                        const serverOnlyChats = (serverState.chatHistory || []).filter(c => !localChatIds.has(c.id));
                        if (serverOnlyChats.length > 0) {
                            state.chatHistory = [...serverOnlyChats, ...state.chatHistory];
                        }
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                    }
                }
            }
            await fetch('/api/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
        } catch (e) {}

        // Cloud sync to Supabase tables
        try {
            if (window.TatadanaSupabase && typeof window.TatadanaSupabase.saveState === 'function') {
                window.TatadanaSupabase.saveState(state).catch(() => {});
            }
        } catch (e) {}
    };

    // Unified Bidirectional State Synchronizer (prevents ghost data resurrection & handles real-time sync)
    window.syncStateFromServer = function (serverState, isInitial = false) {
        if (!serverState) return { changed: false, hasNewFromTg: false };
        const local = window.getTataDanaState();
        let changed = false;
        let hasNewFromTg = false;

        // 1. Merge deletedTxIds bidirectionally
        const localDelTxs = new Set(local.deletedTxIds || []);
        const serverDelTxs = new Set(serverState.deletedTxIds || []);
        const mergedDelTxs = new Set([...localDelTxs, ...serverDelTxs]);
        if (mergedDelTxs.size !== localDelTxs.size) {
            local.deletedTxIds = Array.from(mergedDelTxs);
            changed = true;
        }

        // 2. Merge deletedWalletIds bidirectionally
        const localDelW = new Set(local.deletedWalletIds || []);
        const serverDelW = new Set(serverState.deletedWalletIds || []);
        const mergedDelW = new Set([...localDelW, ...serverDelW]);
        if (mergedDelW.size !== localDelW.size) {
            local.deletedWalletIds = Array.from(mergedDelW);
            changed = true;
        }

        // 3. Purge any transactions in local that have been deleted
        const origTxCount = (local.transactions || []).length;
        local.transactions = (local.transactions || []).filter(t => !mergedDelTxs.has(t.id));
        if (local.transactions.length !== origTxCount) {
            changed = true;
        }

        // Account Clean-Reset Protection (Guarantees newly registered users start and stay at Rp0 saldo, 0 tx, 0 budget)
        const currUser = (typeof window.getTataDanaUser === 'function') ? window.getTataDanaUser() : null;
        const isCleanReset = currUser && currUser.isLoggedIn && currUser.email && (localStorage.getItem('tatadana_account_clean_reset_' + currUser.email) === 'true');

        if (isCleanReset) {
            if (!local.transactions || local.transactions.length === 0) {
                if (serverState) serverState.transactions = [];
                local.transactions = [];
            }
            if (!local.budgets || local.budgets.length === 0) {
                if (serverState) serverState.budgets = [];
                local.budgets = [];
            }
            if ((local.transactions || []).length === 0) {
                if (serverState && Array.isArray(serverState.wallets)) {
                    serverState.wallets = serverState.wallets.map(w => ({ ...w, balance: 0 }));
                }
                if (Array.isArray(local.wallets)) {
                    local.wallets = local.wallets.map(w => ({ ...w, balance: 0 }));
                }
            }
        }

        // 4. Merge server transactions (skipping any deleted ones)
        if (Array.isArray(serverState.transactions)) {
            if (serverState.transactions.length === 0 || (isCleanReset && (local.transactions || []).length === 0)) {
                // If server transactions have been reset to 0 or account is clean reset, keep local transactions clean
                if (!isCleanReset && (local.transactions || []).length > 0 && serverState.transactions.length === 0) {
                    local.transactions = [];
                    changed = true;
                }
            } else {
                const localTxIds = new Set((local.transactions || []).map(t => t.id));
                const newServerTxs = serverState.transactions.filter(t => !localTxIds.has(t.id) && !mergedDelTxs.has(t.id));
                if (newServerTxs.length > 0) {
                    local.transactions = [...newServerTxs, ...(local.transactions || [])];
                    changed = true;
                    if (!isInitial) hasNewFromTg = true;
                }
            }
        }

        // 5. Merge chatHistory
        if (Array.isArray(serverState.chatHistory)) {
            const localChatIds = new Set((local.chatHistory || []).map(c => c.id));
            const newChats = serverState.chatHistory.filter(c => !localChatIds.has(c.id));
            if (newChats.length > 0) {
                local.chatHistory = [...newChats, ...(local.chatHistory || [])];
                changed = true;
                if (!isInitial && newChats.some(c => c.platform === 'telegram')) {
                    hasNewFromTg = true;
                }
            }
        }

        // 6. Merge wallets (filter out deleted wallets)
        if (Array.isArray(serverState.wallets) && serverState.wallets.length > 0) {
            let filteredServerWallets = serverState.wallets.filter(w => !mergedDelW.has(w.id));
            if (isCleanReset && (local.transactions || []).length === 0) {
                filteredServerWallets = filteredServerWallets.map(w => ({ ...w, balance: 0 }));
            }
            if (filteredServerWallets.length > 0) {
                const localWStr = JSON.stringify(local.wallets || []);
                const serverWStr = JSON.stringify(filteredServerWallets);
                if (localWStr !== serverWStr) {
                    local.wallets = filteredServerWallets;
                    changed = true;
                }
            }
        }

        // 7. Merge budgets
        if (Array.isArray(serverState.budgets)) {
            if (isCleanReset && (!local.budgets || local.budgets.length === 0)) {
                // Keep budgets clean for newly registered accounts
            } else {
                const localBStr = JSON.stringify(local.budgets || []);
                const serverBStr = JSON.stringify(serverState.budgets);
                if (localBStr !== serverBStr) {
                    local.budgets = serverState.budgets;
                    changed = true;
                }
            }
        }

        // 8. Merge customCategories
        if (Array.isArray(serverState.customCategories) && serverState.customCategories.length > 0) {
            const mergedCats = [...new Set([...(local.customCategories || []), ...serverState.customCategories])];
            if (mergedCats.length !== (local.customCategories || []).length) {
                local.customCategories = mergedCats;
                changed = true;
            }
        }

        // 9. Sync Telegram credentials
        if (serverState.telegramToken && local.telegramToken !== serverState.telegramToken) {
            local.telegramToken = serverState.telegramToken;
            changed = true;
        }
        if (serverState.telegramBotUsername && local.telegramBotUsername !== serverState.telegramBotUsername) {
            local.telegramBotUsername = serverState.telegramBotUsername;
            changed = true;
        }

        if (changed || isInitial) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
            window.dispatchEvent(new CustomEvent('tatadana-state-updated', { detail: local }));
            if (typeof window.renderDashboard === 'function') window.renderDashboard();
            if (typeof window.renderBudgets === 'function') window.renderBudgets();
            if (typeof window.renderWallets === 'function') window.renderWallets();
            if (typeof window.renderLaporan === 'function') window.renderLaporan();
            if (typeof window.renderTransaksiList === 'function') window.renderTransaksiList();
            if (typeof window.updateFormCategories === 'function') {
                window.updateFormCategories(window.currentFormType || 'expense');
            }
            if (typeof window.renderChatHistory === 'function') {
                window.renderChatHistory();
            } else if (typeof window.renderFullAiChat === 'function') {
                window.renderFullAiChat();
            }
        }

        return { changed, hasNewFromTg, state: local };
    };

    window.renderChatHistory = function () {
        if (typeof window.renderFullAiChat === 'function') {
            window.renderFullAiChat();
        }
    };

    // Ensure tatadana-supabase.js is loaded dynamically if missing
    if (typeof window !== 'undefined' && !window.TatadanaSupabase && typeof document !== 'undefined') {
        const sScript = document.createElement('script');
        sScript.src = '/tatadana-supabase.js';
        sScript.async = true;
        sScript.onload = () => {
            if (window.TatadanaSupabase && typeof window.TatadanaSupabase.fetchState === 'function') {
                window.TatadanaSupabase.fetchState().then(supaState => {
                    if (supaState) window.syncStateFromServer(supaState, true);
                }).catch(() => {});
            }
        };
        document.head.appendChild(sScript);
    }

    // Bidirectional sync on page load: fetch from Supabase & backend state
    try {
        if (window.TatadanaSupabase && typeof window.TatadanaSupabase.fetchState === 'function') {
            window.TatadanaSupabase.fetchState().then(supaState => {
                if (supaState) window.syncStateFromServer(supaState, true);
            }).catch(() => {});
        }
    } catch (e) {}

    try {
        fetch('/api/state')
            .then(res => res.json())
            .then(serverState => {
                if (serverState) {
                    window.syncStateFromServer(serverState, true);
                }
            }).catch(() => {});
    } catch (e) {}

    // Format Rupiah helper
    window.formatRupiahVal = function (num) {
        return 'Rp' + new Intl.NumberFormat('id-ID').format(Math.round(num || 0));
    };

    // 2. Parse Nominal Bahasa Indonesia (jt, rb, k, dot-formatted, raw digits)
    window.parseIndoNominal = function (text) {
        if (!text) return 0;
        const cleaned = text.toLowerCase().trim();

        // Juta (e.g. 1.5jt, 2.5 juta, 10jt)
        const jtMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta|mio)\b/);
        if (jtMatch) {
            return Math.round(parseFloat(jtMatch[1].replace(',', '.')) * 1000000);
        }

        // Ribu (e.g. 25k, 50rb, 100ribu)
        const rbMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu|rebu)\b/);
        if (rbMatch) {
            return Math.round(parseFloat(rbMatch[1].replace(',', '.')) * 1000);
        }

        // Dot formatted (e.g. 250.000, 1.500.000)
        const dotMatch = cleaned.match(/(?:^|\D)(\d{1,3}(?:\.\d{3})+)(?:,\d+)?(?:\D|$)/);
        if (dotMatch) {
            const num = parseInt(dotMatch[1].replace(/\./g, ''), 10);
            if (!isNaN(num) && num > 0) return num;
        }

        // Standalone raw digits (e.g. 50000, rp 25000)
        const numMatch = cleaned.match(/(?:rp\.?\s*|\b)(\d{4,10})\b/);
        if (numMatch) {
            const num = parseInt(numMatch[1], 10);
            if (!isNaN(num) && num > 0) return num;
        }

        const fallbackMatch = cleaned.match(/(\d+)/);
        if (fallbackMatch) {
            const val = parseInt(fallbackMatch[1], 10);
            return val > 100 ? val : val * 1000;
        }

        return 0;
    };

    // 3. UI Initialization & Modal Injection
    window.initAiBotUI = function () {
        // A. Inject Floating Button if not exists
        if (!document.getElementById('floatingAiBotBtn')) {
            const fab = document.createElement('div');
            fab.id = 'floatingAiBotBtn';
            fab.className = 'fixed bottom-6 right-6 z-40';
            fab.innerHTML = `
                <button onclick="openAiChat()" class="px-4 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-2.5 shadow-[0_0_25px_rgba(250,204,21,0.55)] hover:scale-105 active:scale-95 transition-all group border border-yellow-200 cursor-pointer">
                    <div class="w-6 h-6 rounded-lg bg-slate-950 text-yellow-400 flex items-center justify-center font-bold">
                        <i data-lucide="bot" class="w-4 h-4"></i>
                    </div>
                    <span class="tracking-wide">AI Chat Bot</span>
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </button>
            `;
            document.body.appendChild(fab);
        }

        // B. Inject AI Chat Modal if not exists
        if (!document.getElementById('aiChatModal')) {
            const modal = document.createElement('div');
            modal.id = 'aiChatModal';
            modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md';
            modal.innerHTML = `
                <div class="cyber-card cyber-card-glow max-w-lg w-full h-[620px] p-5 sm:p-6 rounded-3xl flex flex-col justify-between border-2 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.25)] bg-[#070A12]">
                    <!-- HEADER -->
                    <div class="flex items-center justify-between pb-3 border-b border-yellow-500/30 shrink-0">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black animate-pulse shadow-[0_0_15px_#facc15]">
                                <i data-lucide="bot" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
                                    TataDana Quantum AI Bot
                                    <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">ONLINE</span>
                                </h3>
                                <span class="text-[10px] text-yellow-400 font-mono">Chat NLP &bull; Pengeluaran, Pemasukan, & Transfer</span>
                            </div>
                        </div>
                        <button onclick="closeAiChat()" class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-yellow-400 hover:border-yellow-400 flex items-center justify-center text-lg font-bold transition">&times;</button>
                    </div>

                    <!-- CHAT BODY -->
                    <div id="aiChatBox" class="flex-1 overflow-y-auto p-3 space-y-3 text-xs font-mono my-2 scroll-smooth">
                        <!-- Initial conversation injected dynamically -->
                    </div>

                    <!-- CHAT INPUT -->
                    <div class="shrink-0 pt-2 border-t border-yellow-500/20 space-y-2">
                        <!-- QUICK SHORTCUT BUTTONS -->
                        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] text-slate-400">
                            <span class="text-yellow-400 font-bold shrink-0">Pilihan Cepat:</span>
                            <button type="button" onclick="selectAiTxType('expense')" class="px-2.5 py-1 rounded-lg bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-400 hover:text-slate-950 transition shrink-0 font-bold">💸 Pengeluaran</button>
                            <button type="button" onclick="selectAiTxType('income')" class="px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-400 hover:text-slate-950 transition shrink-0 font-bold">💰 Pemasukan</button>
                            <button type="button" onclick="selectAiTxType('transfer')" class="px-2.5 py-1 rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400 hover:text-slate-950 transition shrink-0 font-bold">🔄 Transfer</button>
                            <button type="button" onclick="fillAiExample('saldo')" class="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 transition shrink-0 font-mono">/saldo</button>
                            <button type="button" onclick="fillAiExample('budget')" class="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 transition shrink-0 font-mono">/budget</button>
                            <button type="button" onclick="fillAiExample('laporan')" class="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 transition shrink-0 font-mono">/laporan</button>
                            <button type="button" onclick="fillAiExample('riwayat')" class="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 transition shrink-0 font-mono">/riwayat</button>
                            <button type="button" onclick="fillAiExample('hapus')" class="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 transition shrink-0 font-mono">/hapus</button>
                            <button type="button" onclick="fillAiExample('menu')" class="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-yellow-400 transition shrink-0 font-mono">/menu</button>
                            <button type="button" onclick="resetAiChatConversation()" class="px-2 py-1 rounded-lg bg-slate-900 text-slate-500 hover:text-red-400 transition shrink-0 ml-auto" title="Mulai Ulang Percakapan">↺ Reset</button>
                        </div>

                        <form onsubmit="handleAiChatSubmit(event)" class="flex gap-2">
                            <input id="aiChatInput" type="text" autocomplete="off" placeholder="Tanya atau ketik transaksi... (contoh: beli kopi 25rb)" class="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-yellow-500/30 text-white text-xs font-mono focus:outline-none focus:border-yellow-400" />
                            <button type="submit" class="yellow-btn px-5 py-2.5 rounded-xl text-xs font-black shadow-[0_0_15px_#facc15] shrink-0">
                                Kirim
                            </button>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Render initial welcome if chat is empty
        const chatBox = document.getElementById('aiChatBox');
        if (chatBox && chatBox.children.length === 0) {
            renderAiInitialGreeting();
        }

        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    };

    // 4. Full Synchronized Chat History & Interactive Greeting
    window.renderFullAiChat = function () {
        const chatBox = document.getElementById('aiChatBox');
        if (!chatBox) return;

        const state = window.getTataDanaState();
        const history = state.chatHistory || [];

        let html = `
            <div class="flex gap-2.5">
                <div class="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                <div class="bg-slate-900/90 border border-yellow-500/30 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 text-xs space-y-2.5 max-w-[90%] shadow-lg">
                    <p class="font-bold text-white text-sm">Halo Budi! Ingin mencatat transaksi apa sekarang?</p>
                    <p class="text-[11px] text-slate-300 leading-relaxed">
                        Silakan pilih jenis transaksi di bawah atau langsung ketik dengan bahasa santai:
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <button type="button" onclick="selectAiTxType('expense')" class="px-3 py-2 rounded-xl bg-yellow-400/10 hover:bg-yellow-400 text-yellow-300 hover:text-slate-950 border border-yellow-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm text-center">
                            <span>💸</span> Pengeluaran
                        </button>
                        <button type="button" onclick="selectAiTxType('income')" class="px-3 py-2 rounded-xl bg-emerald-400/10 hover:bg-emerald-400 text-emerald-300 hover:text-slate-950 border border-emerald-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm text-center">
                            <span>💰</span> Pemasukan
                        </button>
                        <button type="button" onclick="selectAiTxType('transfer')" class="px-3 py-2 rounded-xl bg-cyan-400/10 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 border border-cyan-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm text-center">
                            <span>🔄</span> Transfer
                        </button>
                    </div>
                    <div class="pt-1 text-[10px] text-slate-400 border-t border-slate-800">
                        💡 <em>Tips: Bot otomatis sinkron dengan Bot Telegram & mencatat ke semua dompet & laporan.</em>
                    </div>
                </div>
            </div>
        `;

        if (history.length > 0) {
            const chronological = [...history].reverse();
            for (const item of chronological) {
                const isTg = item.platform === 'telegram' || item.sender === 'telegram_user';
                const badge = isTg ? '<span class="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-400/40 ml-2 font-mono font-bold tracking-tight shadow-sm">[📱 Telegram]</span>' : '<span class="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-400/40 ml-2 font-mono font-bold tracking-tight shadow-sm">[🌐 Web]</span>';
                const senderTitle = isTg ? 'Budi (via Telegram)' : 'Budi';

                html += `
                    <div class="flex justify-end mt-3">
                        <div class="bg-yellow-400 text-slate-950 font-bold p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md break-words">
                            <div class="flex items-center justify-between gap-2 text-[10px] text-slate-900 font-mono mb-1 font-semibold border-b border-yellow-500/50 pb-1">
                                <span>${senderTitle} &bull; ${item.time || ''}</span>
                                ${badge}
                            </div>
                            <div class="text-xs font-medium">${item.text}</div>
                        </div>
                    </div>
                `;

                if (item.reply) {
                    const formattedReply = item.reply.replace(/\n/g, '<br/>');
                    const botBadge = isTg ? '<span class="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-400/30 font-mono font-bold">[📱 Telegram]</span>' : '<span class="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-400/30 font-mono font-bold">[🌐 Web]</span>';
                    html += `
                        <div class="flex gap-2.5 mt-3">
                            <div class="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs shadow-[0_0_12px_#facc15]">🤖</div>
                            <div class="bg-slate-900 p-3.5 rounded-2xl rounded-tl-sm text-yellow-300 border border-yellow-500/30 leading-relaxed shadow-lg max-w-[90%] font-mono text-xs">
                                <div class="flex items-center justify-between gap-2 text-[10px] text-yellow-400/80 font-mono mb-1.5 pb-1 border-b border-yellow-500/20 font-semibold">
                                    <span>TataDana Bot &bull; ${item.time || ''}</span>
                                    ${botBadge}
                                </div>
                                <div>${formattedReply}</div>
                            </div>
                        </div>
                    `;
                }
            }
        }

        chatBox.innerHTML = html;
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    window.renderAiInitialGreeting = function () {
        renderFullAiChat();
    };

    window.resetAiChatConversation = function () {
        window._tatadanaActiveTxType = null;
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.value = '';
            input.placeholder = 'Tanya atau ketik transaksi... (contoh: beli kopi 25rb)';
        }
        renderFullAiChat();
    };

    // 5. Select Transaction Type via Interactive Buttons
    window.selectAiTxType = function (type) {
        window._tatadanaActiveTxType = type;
        const chatBox = document.getElementById('aiChatBox');
        const input = document.getElementById('aiChatInput');
        if (!chatBox) return;

        let botReply = '';
        let placeholder = '';

        if (type === 'expense') {
            botReply = `
                <div class="flex gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                    <div class="bg-slate-900 p-3 rounded-2xl rounded-tl-sm text-yellow-300 border border-yellow-500/40 leading-relaxed max-w-[88%]">
                        <strong class="text-white">Mode Pengeluaran 💸 Aktif!</strong><br/>
                        Silakan ketik detail pengeluaranmu beserta nominal dan dompetnya.<br/>
                        <span class="text-slate-300 mt-1 block">Contoh:</span>
                        • <code class="text-yellow-400 cursor-pointer" onclick="fillAiInput('beli nasi padang 35rb')">beli nasi padang 35rb</code><br/>
                        • <code class="text-yellow-400 cursor-pointer" onclick="fillAiInput('ngopi 25rb di bca')">ngopi 25rb di bca</code><br/>
                        • <code class="text-yellow-400 cursor-pointer" onclick="fillAiInput('isi bensin 50k gopay')">isi bensin 50k gopay</code>
                    </div>
                </div>
            `;
            placeholder = 'Ketik pengeluaran... (contoh: makan siang 35rb)';
        } else if (type === 'income') {
            botReply = `
                <div class="flex gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                    <div class="bg-slate-900 p-3 rounded-2xl rounded-tl-sm text-emerald-300 border border-emerald-500/40 leading-relaxed max-w-[88%]">
                        <strong class="text-white">Mode Pemasukan 💰 Aktif!</strong><br/>
                        Silakan ketik detail uang masuk atau gajianmu.<br/>
                        <span class="text-slate-300 mt-1 block">Contoh:</span>
                        • <code class="text-emerald-400 cursor-pointer" onclick="fillAiInput('gajian 8.5jt bca')">gajian 8.5jt bca</code><br/>
                        • <code class="text-emerald-400 cursor-pointer" onclick="fillAiInput('bonus freelance 1.5jt mandiri')">bonus freelance 1.5jt mandiri</code><br/>
                        • <code class="text-emerald-400 cursor-pointer" onclick="fillAiInput('cair cashback 100k gopay')">cair cashback 100k gopay</code>
                    </div>
                </div>
            `;
            placeholder = 'Ketik pemasukan... (contoh: gajian 8.5jt bca)';
        } else if (type === 'transfer') {
            botReply = `
                <div class="flex gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                    <div class="bg-slate-900 p-3 rounded-2xl rounded-tl-sm text-cyan-300 border border-cyan-500/40 leading-relaxed max-w-[88%]">
                        <strong class="text-white">Mode Transfer Antar Dompet 🔄 Aktif!</strong><br/>
                        Sebutkan nominal, dompet asal, dan dompet tujuan.<br/>
                        <span class="text-slate-300 mt-1 block">Contoh:</span>
                        • <code class="text-cyan-400 cursor-pointer" onclick="fillAiInput('transfer 100rb dari BCA ke GoPay')">transfer 100rb dari BCA ke GoPay</code><br/>
                        • <code class="text-cyan-400 cursor-pointer" onclick="fillAiInput('pindah dana 500k mandiri ke bca')">pindah dana 500k mandiri ke bca</code><br/>
                        • <code class="text-cyan-400 cursor-pointer" onclick="fillAiInput('topup gopay 200rb dari bca')">topup gopay 200rb dari bca</code>
                    </div>
                </div>
            `;
            placeholder = 'Ketik transfer... (contoh: transfer 100rb dari BCA ke GoPay)';
        }

        chatBox.innerHTML += botReply;
        chatBox.scrollTop = chatBox.scrollHeight;
        if (input) {
            input.placeholder = placeholder;
            input.focus();
        }
    };

    window.fillAiInput = function (text) {
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.value = text;
            input.focus();
        }
    };

    window.fillAiExample = function (cmd) {
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.value = '/' + cmd;
            handleAiChatSubmit(new Event('submit'));
        }
    };

    // 6. Open / Close AI Chat Modal
    window.openAiChat = function () {
        if (typeof window.isTataDanaPremium === 'function' && !window.isTataDanaPremium()) {
            if (typeof window.showPremiumFeatureModal === 'function') {
                window.showPremiumFeatureModal('Chat Bot AI & Telegram Bot', 'Fitur interaktif Quantum Chat Bot AI dan sinkronisasi bot Telegram eksklusif untuk pengguna paket Premium TataDana. Silakan upgrade untuk menikmati asisten finansial 24/7.');
            } else if (typeof window.showTataDanaToast === 'function') {
                window.showTataDanaToast('Fitur AI Chat Bot eksklusif untuk pengguna Premium.', 'error');
            }
            return;
        }

        initAiBotUI();
        const modal = document.getElementById('aiChatModal');
        if (modal) {
            modal.classList.remove('hidden');
            renderFullAiChat();
            const input = document.getElementById('aiChatInput');
            if (input) setTimeout(() => input.focus(), 100);
        }
    };

    window.closeAiChat = function () {
        const modal = document.getElementById('aiChatModal');
        if (modal) modal.classList.add('hidden');
    };

    // 7. Full Natural Language Submission Engine
    window.handleAiChatSubmit = function (e) {
        if (e) e.preventDefault();

        if (typeof window.isTataDanaPremium === 'function' && !window.isTataDanaPremium()) {
            if (typeof window.showPremiumFeatureModal === 'function') {
                window.showPremiumFeatureModal('Chat Bot AI & Telegram Bot', 'Fitur interaktif Quantum Chat Bot AI eksklusif untuk pengguna paket Premium TataDana.');
            }
            return;
        }

        const input = document.getElementById('aiChatInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const chatBox = document.getElementById('aiChatBox');
        if (!chatBox) return;

        // User bubble
        chatBox.innerHTML += `
            <div class="flex justify-end">
                <div class="bg-yellow-400 text-slate-950 font-bold p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md break-words">${text}</div>
            </div>
        `;
        input.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        const cleaned = text.toLowerCase();
        const state = window.getTataDanaState();

        // Check for bot slash commands
        if (cleaned.startsWith('/')) {
            handleBotCommandsInChat(cleaned, state, chatBox);
            return;
        }

        // Determine Transaction Type
        let type = window._tatadanaActiveTxType;
        const isTransferKeyword = cleaned.includes('transfer') || cleaned.includes('tf') || cleaned.includes('pindah') || cleaned.includes('oper') || cleaned.includes('topup') || (cleaned.includes('dari') && cleaned.includes('ke'));
        const isIncomeKeyword = cleaned.includes('gaji') || cleaned.includes('gajian') || cleaned.includes('masuk') || cleaned.includes('cair') || cleaned.includes('bonus') || cleaned.includes('thr') || cleaned.includes('freelance') || cleaned.includes('proyek') || cleaned.includes('investasi') || cleaned.includes('dividen') || cleaned.includes('hadiah') || cleaned.includes('angpao') || cleaned.includes('jual') || cleaned.includes('dapat uang') || cleaned.includes('pemasukan');

        if (isTransferKeyword) {
            type = 'transfer';
        } else if (isIncomeKeyword && type !== 'transfer') {
            type = 'income';
        } else if (!type) {
            type = 'expense';
        }

        // Reset active intent after use
        window._tatadanaActiveTxType = null;
        input.placeholder = 'Tanya atau ketik transaksi... (contoh: beli kopi 25rb)';

        const amount = window.parseIndoNominal(cleaned);
        if (!amount || amount <= 0) {
            chatBox.innerHTML += `
                <div class="flex gap-2.5 mt-2">
                    <div class="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                    <div class="bg-slate-900 p-3.5 rounded-2xl rounded-tl-sm text-yellow-300 border border-yellow-500/30 leading-relaxed shadow-lg max-w-[90%] font-mono text-xs">
                        ⚠️ <strong>Mohon sertakan nominal transaksi yang valid.</strong><br/>
                        Contoh format:<br/>
                        • <code class="text-yellow-400 cursor-pointer underline" onclick="fillAiInput('makan siang 35rb di bca')">makan siang 35rb di bca</code><br/>
                        • <code class="text-yellow-400 cursor-pointer underline" onclick="fillAiInput('gajian 10jt di bca')">gajian 10jt di bca</code><br/>
                        • <code class="text-yellow-400 cursor-pointer underline" onclick="fillAiInput('transfer 100rb dari BCA ke GoPay')">transfer 100rb dari BCA ke GoPay</code>
                    </div>
                </div>
            `;
            chatBox.scrollTop = chatBox.scrollHeight;
            return;
        }
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Helper to find wallet by name or alias
        function matchWallet(str) {
            for (const w of state.wallets) {
                const wname = w.name.toLowerCase();
                if (str.includes(wname)) return w;
            }
            return null;
        }

        // --- A. TRANSFER TRANSACTION ---
        if (type === 'transfer') {
            let sourceW = null;
            let targetW = null;

            // Pattern: dari [wallet] ke [wallet]
            const dariMatch = cleaned.match(/dari\s+([a-zA-Z0-9]+)/);
            const keMatch = cleaned.match(/ke\s+([a-zA-Z0-9]+)/);

            if (dariMatch) {
                sourceW = state.wallets.find(w => w.name.toLowerCase() === dariMatch[1].toLowerCase());
            }
            if (keMatch) {
                targetW = state.wallets.find(w => w.name.toLowerCase() === keMatch[1].toLowerCase());
            }

            // Fallback: match any wallet occurrences in text
            if (!sourceW || !targetW) {
                const foundWallets = [];
                state.wallets.forEach(w => {
                    if (cleaned.includes(w.name.toLowerCase())) {
                        foundWallets.push(w);
                    }
                });

                if (foundWallets.length >= 2) {
                    sourceW = sourceW || foundWallets[0];
                    targetW = targetW || foundWallets[1];
                } else if (foundWallets.length === 1) {
                    if (keMatch) {
                        targetW = foundWallets[0];
                        sourceW = state.wallets.find(w => w.isDefault && w.id !== targetW.id) || state.wallets.find(w => w.id !== targetW.id);
                    } else {
                        sourceW = foundWallets[0];
                        targetW = state.wallets.find(w => w.id !== sourceW.id);
                    }
                }
            }

            // Ultimate fallback
            if (!sourceW) sourceW = state.wallets.find(w => w.isDefault) || state.wallets[0];
            if (!targetW || targetW.id === sourceW.id) {
                targetW = state.wallets.find(w => w.id !== sourceW.id) || state.wallets[1] || sourceW;
            }

            // Execute balance transfer
            sourceW.balance -= amount;
            targetW.balance += amount;

            const newTx = {
                id: 'tx_ai_' + Date.now(),
                type: 'transfer',
                amount: amount,
                walletId: sourceW.id,
                walletName: sourceW.name,
                targetWalletId: targetW.id,
                targetWalletName: targetW.name,
                category: '🔄 Transfer Antar Dompet',
                note: text,
                date: dateStr,
                datetime: `${dateStr} ${timeStr}`
            };

            const replySummary = `✓ Transfer Antar Dompet Berhasil!\n├ Nominal : ${window.formatRupiahVal(amount)}\n├ Dari Dompet : 👛 ${sourceW.name} (Sisa: ${window.formatRupiahVal(sourceW.balance)})\n├ Ke Dompet : 📱 ${targetW.name} (Saldo: ${window.formatRupiahVal(targetW.balance)})\n└ Status : Terbukukan Real-time`;
            state.chatHistory = [
                {
                    id: 'ch_' + Date.now(),
                    sender: 'web_user',
                    text: text,
                    reply: replySummary,
                    time: `${dateStr} ${timeStr}`,
                    platform: 'web'
                },
                ...(state.chatHistory || [])
            ];

            state.transactions.unshift(newTx);
            window.saveTataDanaState(state);

            setTimeout(() => {
                chatBox.innerHTML += `
                    <div class="flex gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                        <div class="bg-slate-900 p-3.5 rounded-2xl rounded-tl-sm text-cyan-300 border border-cyan-500/30 leading-relaxed shadow-lg max-w-[90%] font-mono">
                            <div class="font-extrabold text-white text-xs mb-1 flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                                ✓ Transfer Antar Dompet Berhasil!
                            </div>
                            ├ Nominal : <strong>${window.formatRupiahVal(amount)}</strong><br/>
                            ├ Dari Dompet : 👛 <strong>${sourceW.name}</strong> (Sisa: ${window.formatRupiahVal(sourceW.balance)})<br/>
                            ├ Ke Dompet : 📱 <strong>${targetW.name}</strong> (Saldo: ${window.formatRupiahVal(targetW.balance)})<br/>
                            └ Keterangan : <em>"${text}"</em>
                            <div class="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                                🔄 Tersinkronisasi otomatis ke Laporan & Saldo Multi-Dompet
                            </div>
                        </div>
                    </div>
                `;
                chatBox.scrollTop = chatBox.scrollHeight;
                if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
            }, 300);
            return;
        }

        // --- B. PEMASUKAN TRANSACTION ---
        if (type === 'income') {
            const detectedWallet = matchWallet(cleaned) || state.wallets.find(w => w.isDefault) || state.wallets[0];

            let cat = '💰 Gaji Pokok & Upah';
            if (cleaned.includes('bonus') || cleaned.includes('thr')) cat = '⚡ Bonus, THR & Insentif';
            else if (cleaned.includes('freelance') || cleaned.includes('proyek')) cat = '💼 Freelance & Side Project';
            else if (cleaned.includes('investasi') || cleaned.includes('dividen') || cleaned.includes('saham') || cleaned.includes('crypto')) cat = '📈 Hasil Investasi & Dividen';
            else if (cleaned.includes('hadiah') || cleaned.includes('angpao')) cat = '🎁 Hadiah & Pemberian Uang';
            else if (cleaned.includes('jual') || cleaned.includes('cashback')) cat = '🏷️ Penjualan Barang / Cashback';
            else if (cleaned.includes('piutang') || cleaned.includes('utang')) cat = '💵 Pengembalian Pinjaman / Piutang';

            detectedWallet.balance += amount;

            const newTx = {
                id: 'tx_ai_' + Date.now(),
                type: 'income',
                amount: amount,
                walletId: detectedWallet.id,
                walletName: detectedWallet.name,
                category: cat,
                note: text,
                date: dateStr,
                datetime: `${dateStr} ${timeStr}`
            };

            const replySummary = `✓ Pemasukan Berhasil Dicatat!\n├ Nominal : +${window.formatRupiahVal(amount)}\n├ Kategori : ${cat}\n├ Masuk ke : 👛 ${detectedWallet.name}\n└ Saldo Baru : ${window.formatRupiahVal(detectedWallet.balance)}`;
            state.chatHistory = [
                {
                    id: 'ch_' + Date.now(),
                    sender: 'web_user',
                    text: text,
                    reply: replySummary,
                    time: `${dateStr} ${timeStr}`,
                    platform: 'web'
                },
                ...(state.chatHistory || [])
            ];

            state.transactions.unshift(newTx);
            window.saveTataDanaState(state);

            setTimeout(() => {
                chatBox.innerHTML += `
                    <div class="flex gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                        <div class="bg-slate-900 p-3.5 rounded-2xl rounded-tl-sm text-emerald-300 border border-emerald-500/30 leading-relaxed shadow-lg max-w-[90%] font-mono">
                            <div class="font-extrabold text-white text-xs mb-1 flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                ✓ Pemasukan Berhasil Dicatat!
                            </div>
                            ├ Jenis : <strong>PEMASUKAN</strong><br/>
                            ├ Nominal : <strong>+${window.formatRupiahVal(amount)}</strong><br/>
                            ├ Kategori : ${cat}<br/>
                            ├ Masuk ke : 👛 <strong>${detectedWallet.name}</strong><br/>
                            └ Saldo Baru : <strong>${window.formatRupiahVal(detectedWallet.balance)}</strong>
                            <div class="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                                ✨ Saldo telah ditambahkan dan dicatat di histori arus kas
                            </div>
                        </div>
                    </div>
                `;
                chatBox.scrollTop = chatBox.scrollHeight;
                if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
            }, 300);
            return;
        }

        // --- C. PENGELUARAN TRANSACTION ---
        const detectedWallet = matchWallet(cleaned) || state.wallets.find(w => w.isDefault) || state.wallets[0];

        // 1. Check custom categories (from budget or customCategories) FIRST
        let matchedCategory = null;
        const allCustomCats = [...new Set([
            ...(state.budgets || []).map(b => b.name),
            ...(state.customCategories || [])
        ])];

        for (const c of allCustomCats) {
            const raw = c.replace(/^[^\w\s]+/, '').trim().toLowerCase();
            if (raw && cleaned.includes(raw)) {
                matchedCategory = c;
                break;
            }
        }

        // 2. Fallback to standard expense categories
        if (!matchedCategory) {
            if (cleaned.includes('bensin') || cleaned.includes('gojek') || cleaned.includes('grab') || cleaned.includes('parkir') || cleaned.includes('tol') || cleaned.includes('transport')) {
                matchedCategory = '🚗 Transportasi & Bensin';
            } else if (cleaned.includes('kopi') || cleaned.includes('ngopi') || cleaned.includes('kafe') || cleaned.includes('cafe') || cleaned.includes('nongkrong')) {
                matchedCategory = '☕ Kopi & Nongkrong';
            } else if (cleaned.includes('listrik') || cleaned.includes('pln') || cleaned.includes('air') || cleaned.includes('pdam') || cleaned.includes('tagihan')) {
                matchedCategory = '🏠 Listrik PLN, Air & Tagihan';
            } else if (cleaned.includes('pulsa') || cleaned.includes('wifi') || cleaned.includes('kuota') || cleaned.includes('indihome')) {
                matchedCategory = '🌐 Pulsa, Data & WiFi';
            } else if (cleaned.includes('belanja') || cleaned.includes('baju') || cleaned.includes('sepatu') || cleaned.includes('fashion')) {
                matchedCategory = '👕 Belanja Fashion & Pakaian';
            } else if (cleaned.includes('supermarket') || cleaned.includes('indomaret') || cleaned.includes('alfamart') || cleaned.includes('sayur')) {
                matchedCategory = '🛒 Supermarket & Kebutuhan Rumah';
            } else if (cleaned.includes('game') || cleaned.includes('steam') || cleaned.includes('netflix') || cleaned.includes('nonton') || cleaned.includes('bioskop')) {
                matchedCategory = '🎮 Hiburan, Game & Streaming';
            } else if (cleaned.includes('obat') || cleaned.includes('dokter') || cleaned.includes('apotek') || cleaned.includes('bpjs')) {
                matchedCategory = '💊 Kesehatan, Obat & BPJS';
            } else if (cleaned.includes('buku') || cleaned.includes('kursus') || cleaned.includes('sekolah') || cleaned.includes('kuliah')) {
                matchedCategory = '📚 Pendidikan, Buku & Kursus';
            } else if (cleaned.includes('sedekah') || cleaned.includes('zakat') || cleaned.includes('donasi') || cleaned.includes('infaq')) {
                matchedCategory = '🎁 Sedekah, Zakat & Donasi';
            } else {
                matchedCategory = '🍜 Makanan & Minuman';
            }
        }

        detectedWallet.balance -= amount;

        const newTx = {
            id: 'tx_ai_' + Date.now(),
            type: 'expense',
            amount: amount,
            walletId: detectedWallet.id,
            walletName: detectedWallet.name,
            category: matchedCategory,
            note: text,
            date: dateStr,
            datetime: `${dateStr} ${timeStr}`
        };

        const replySummary = `✓ Pengeluaran Berhasil Dicatat!\n├ Nominal : -${window.formatRupiahVal(amount)}\n├ Kategori : ${matchedCategory}\n├ Dompet : 👛 ${detectedWallet.name}\n└ Sisa Saldo : ${window.formatRupiahVal(detectedWallet.balance)}`;
        state.chatHistory = [
            {
                id: 'ch_' + Date.now(),
                sender: 'web_user',
                text: text,
                reply: replySummary,
                time: `${dateStr} ${timeStr}`,
                platform: 'web'
            },
            ...(state.chatHistory || [])
        ];

        state.transactions.unshift(newTx);
        window.saveTataDanaState(state);

        // Budget tracking progress check
        const cleanCatName = matchedCategory.replace(/^[^\w\s]+/, '').trim().toLowerCase();
        const relatedBudget = (state.budgets || []).find(b => {
            const bRaw = b.name.replace(/^[^\w\s]+/, '').trim().toLowerCase();
            return bRaw === cleanCatName || matchedCategory.toLowerCase().includes(bRaw);
        });

        let budgetAlertHtml = '';
        if (relatedBudget && relatedBudget.limit > 0) {
            const spent = state.transactions
                .filter(t => t.type === 'expense' && t.category && t.category.toLowerCase().includes(cleanCatName))
                .reduce((acc, t) => acc + t.amount, 0);
            const pct = Math.min(100, Math.round((spent / relatedBudget.limit) * 100));
            const filledBlocks = Math.round(pct / 10);
            const bar = '█'.repeat(filledBlocks) + '░'.repeat(Math.max(0, 10 - filledBlocks));
            const sisa = Math.max(0, relatedBudget.limit - spent);

            let statusColor = pct >= 100 ? 'text-red-400' : pct >= 80 ? 'text-amber-400' : 'text-yellow-400';
            budgetAlertHtml = `
                <div class="mt-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div class="flex justify-between font-mono ${statusColor}">
                        <span>Budget ${relatedBudget.name}:</span>
                        <span>[${bar}] ${pct}%</span>
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono flex justify-between mt-0.5">
                        <span>Terpakai: ${window.formatRupiahVal(spent)}</span>
                        <span>Sisa: ${window.formatRupiahVal(sisa)}</span>
                    </div>
                    ${pct >= 100 ? '<div class="text-[10px] text-red-400 font-bold mt-1">⚠️ PERINGATAN: Budget telah melampaui 100%! Alert otomatis dikirim ke Telegram.</div>' : pct >= 80 ? '<div class="text-[10px] text-amber-400 font-bold mt-1">⚡ Waspada: Budget sudah 80% ke atas. Harap rem pengeluaran!</div>' : ''}
                </div>
            `;
        }

        setTimeout(() => {
            chatBox.innerHTML += `
                <div class="flex gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                    <div class="bg-slate-900 p-3.5 rounded-2xl rounded-tl-sm text-yellow-300 border border-yellow-500/30 leading-relaxed shadow-lg max-w-[90%] font-mono">
                        <div class="font-extrabold text-white text-xs mb-1 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                            ✓ Pengeluaran Berhasil Dicatat!
                        </div>
                        ├ Nominal : <strong>-${window.formatRupiahVal(amount)}</strong><br/>
                        ├ Kategori : <strong>${matchedCategory}</strong><br/>
                        ├ Dompet : 👛 <strong>${detectedWallet.name}</strong><br/>
                        └ Sisa Saldo : <strong>${window.formatRupiahVal(detectedWallet.balance)}</strong>
                        ${budgetAlertHtml}
                    </div>
                </div>
            `;
            chatBox.scrollTop = chatBox.scrollHeight;
            if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        }, 300);
    };

    // 8. Bot Command Processor (/saldo, /budget, /laporan, /riwayat, /hapus, /menu)
    function handleBotCommandsInChat(cmd, state, chatBox) {
        let reply = '';
        if (cmd === '/saldo') {
            const total = state.wallets.reduce((a, b) => a + b.balance, 0);
            const wLines = state.wallets.map(w => `├ ${w.isDefault ? '⭐ ' : ''}${w.name}: <strong>${window.formatRupiahVal(w.balance)}</strong>`).join('<br/>');
            reply = `
                <strong class="text-white">👛 Saldo Dompet TataDana:</strong><br/>
                ${wLines}<br/>
                └ Total Saldo: <strong class="text-white">${window.formatRupiahVal(total)}</strong><br/><br/>
                🌐 <a href="/wallet" class="text-yellow-400 underline font-bold">Kelola Dompet & Saldo</a> | <a href="/dashboard" class="text-yellow-400 underline font-bold">Dashboard</a>
            `;
        } else if (cmd === '/budget') {
            if (!state.budgets || state.budgets.length === 0) {
                reply = 'Belum ada budget aktif. Silakan tambahkan di menu <a href="/budget" class="text-yellow-400 underline font-bold">Budgeting</a>!';
            } else {
                const bLines = state.budgets.map(b => {
                    const raw = b.name.replace(/^[^\w\s]+/, '').trim().toLowerCase();
                    const spent = (state.transactions || [])
                        .filter(t => t.type === 'expense' && t.category && t.category.toLowerCase().includes(raw))
                        .reduce((acc, t) => acc + t.amount, 0);
                    const pct = Math.min(100, Math.round((spent / b.limit) * 100));
                    return `• ${b.name}: ${pct}% (${window.formatRupiahVal(spent)} / ${window.formatRupiahVal(b.limit)})`;
                }).join('<br/>');
                reply = `<strong class="text-white">🎯 Status Budget Bulan Ini:</strong><br/>${bLines}<br/><br/>🌐 <a href="/budget" class="text-yellow-400 underline font-bold">Buka Manajemen Budget</a>`;
            }
        } else if (cmd === '/riwayat' || cmd === '/history') {
            const recent = (state.chatHistory || []).slice(0, 5);
            if (recent.length === 0) {
                reply = '💬 Belum ada riwayat percakapan yang tersimpan.';
            } else {
                const lines = recent.map(c => {
                    const badge = c.platform === 'telegram' ? '📱 Telegram' : '🌐 Web';
                    return `• [${badge} - ${c.time || ''}] <em>${c.text}</em>`;
                }).join('<br/>');
                reply = `<strong class="text-white">💬 Riwayat Chat Terakhir (Sinkron Web & Telegram):</strong><br/>${lines}<br/><br/>🌐 <a href="/dashboard" class="text-yellow-400 underline font-bold">Lihat Transaksi di Dashboard</a>`;
            }
        } else if (cmd === '/laporan' || cmd === '/sheet') {
            reply = `📊 Buka menu <a href="/laporan" class="text-yellow-400 underline font-bold">Laporan & Export</a> untuk riwayat mutasi lengkap, grafik keuangan, serta unduh PDF & Excel.`;
        } else if (cmd === '/hapus' || cmd === '/batal' || cmd === '/undo') {
            const delList = state.deletedTxIds || [];
            const lastTx = (state.transactions || []).find(t => !delList.includes(t.id));
            if (!lastTx) {
                reply = `⚠️ Tidak ada transaksi aktif yang dapat dibatalkan atau dihapus.<br/><br/>🌐 <a href="/dashboard" class="text-yellow-400 underline font-bold">Cek Riwayat di Dashboard</a>`;
            } else {
                window.deleteTransaction(lastTx.id);
                reply = `✓ Transaksi terakhir (<strong>${lastTx.category || lastTx.note || 'Transaksi'}</strong> - <strong>${window.formatRupiahVal(lastTx.amount)}</strong>) berhasil dibatalkan & saldo telah dikembalikan!<br/><br/>🌐 <a href="/dashboard" class="text-yellow-400 underline font-bold">Cek Dashboard</a>`;
            }
        } else if (cmd === '/menu' || cmd === '/start' || cmd === '/help' || cmd === '/bantuan') {
            reply = `
                <strong class="text-white">🌟 Menu Navigasi TataDana Quantum AI:</strong><br/>
                • <code>/saldo</code> - Cek saldo dompet<br/>
                • <code>/budget</code> - Status limit budgeting<br/>
                • <code>/laporan</code> - Laporan mutasi & arus kas<br/>
                • <code>/riwayat</code> - Riwayat sinkronisasi chat web & telegram<br/>
                • <code>/hapus</code> - Batalkan transaksi terakhir & rollback saldo<br/>
                • <code>/menu</code> - Buka menu ini<br/><br/>
                <strong class="text-yellow-400">🌐 Tautan Langsung Halaman Web:</strong><br/>
                • 🏠 <a href="/dashboard" class="text-yellow-400 underline font-bold">Dashboard Utama & Mutasi</a><br/>
                • 🎯 <a href="/budget" class="text-yellow-400 underline font-bold">Manajemen Budget</a><br/>
                • 👛 <a href="/wallet" class="text-yellow-400 underline font-bold">Dompet & Saldo</a><br/>
                • 📊 <a href="/laporan" class="text-yellow-400 underline font-bold">Laporan & Grafik</a><br/>
                • 🔐 <a href="/login" class="text-yellow-400 underline font-bold">Halaman Login</a>
            `;
        } else {
            reply = `
                <strong class="text-white">✨ Panduan Command Quantum AI Bot:</strong><br/>
                • <code>/saldo</code> - Cek saldo semua dompet<br/>
                • <code>/budget</code> - Pantau pemakaian batas budget<br/>
                • <code>/laporan</code> - Buka laporan keuangan lengkap<br/>
                • <code>/riwayat</code> - Cek riwayat sinkronisasi chat web & telegram<br/>
                • <code>/hapus</code> - Batalkan transaksi terakhir<br/>
                • <code>/menu</code> - Tampilkan semua menu navigasi & link web<br/>
                <div class="mt-2 text-slate-300">
                    Atau langsung ketik transaksi natural:<br/>
                    • <em>"beli nasi padang 25rb"</em><br/>
                    • <em>"gajian 8.5jt bca"</em><br/>
                    • <em>"transfer 100rb dari BCA ke GoPay"</em>
                </div>
            `;
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        state.chatHistory = [
            {
                id: 'ch_' + Date.now(),
                sender: 'web_user',
                text: cmd,
                reply: reply.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
                time: `${dateStr} ${timeStr}`,
                platform: 'web'
            },
            ...(state.chatHistory || [])
        ];
        window.saveTataDanaState(state);

        setTimeout(() => {
            chatBox.innerHTML += `
                <div class="flex gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">🤖</div>
                    <div class="bg-slate-900 p-3.5 rounded-2xl rounded-tl-sm text-yellow-300 border border-yellow-500/30 leading-relaxed shadow-lg max-w-[90%] font-mono">
                        ${reply}
                    </div>
                </div>
            `;
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 200);
    }

    // 9. Sync to Telegram Webhook Endpoint
    // 9. Synchronize Telegram Webhook (No-op from web bot to prevent duplicate transactions)
    function syncTelegramWebhookMessage(msg) {
        // Disabled to prevent double recording
    }

    // 10. Start Live High-Frequency State Polling & Token Auto-Sync
    function startTelegramPolling() {
        const savedToken = localStorage.getItem('tatadana_telegram_token') || '8901649639:AAEiVyOO7dM76YAl8RmhoFiGtwekD7KFmhQ';
        if (savedToken) {
            fetch('/api/telegram/save-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: savedToken })
            }).catch(() => {});
        }

        // Live state polling every 1000ms
        setInterval(async () => {
            try {
                const res = await fetch('/api/state', {
                    cache: 'no-store',
                    headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
                });
                if (res.ok) {
                    const serverState = await res.json();
                    if (serverState) {
                        const result = window.syncStateFromServer(serverState, false);
                        if (result && result.hasNewFromTg) {
                            window.showTataDanaToast('📱 Transaksi & Chat Telegram berhasil disinkronkan real-time!', 'info');
                        }
                    }
                }
            } catch (e) {}
        }, 1000);
    }

    // 11. Automatically initialize on DOM ready
    function handleAppInit() {
        initAiBotUI();
        startTelegramPolling();
        window.initCurrencyInputs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleAppInit);
    } else {
        handleAppInit();
    }
})();

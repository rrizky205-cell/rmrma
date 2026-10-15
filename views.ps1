# ==============================================================================
# TataDana Views & Endpoints Implementation (100% Indonesian, Silver & Slate + Orange)
# ==============================================================================

function Get-NavbarHtml($active = "") {
    return @"
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <a href="/" class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                        <i data-lucide="wallet-cards" class="w-5 h-5"></i>
                    </div>
                    <span class="text-xl font-bold tracking-tight text-slate-900">Tata<span class="text-brand-500">Dana</span></span>
                </a>
                <span class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                    Fintech Cerdas
                </span>
            </div>
            
            <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                <a href="/#fitur" class="hover:text-brand-500 transition-colors">Fitur Utama</a>
                <a href="/#demo" class="hover:text-brand-500 transition-colors">Cara Kerja</a>
                <a href="/#pricing" class="hover:text-brand-500 transition-colors">Harga Paket</a>
                <a href="/#faq" class="hover:text-brand-500 transition-colors">FAQ</a>
            </div>

            <div class="flex items-center gap-3">
                <a href="/login" class="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">
                    Masuk
                </a>
                <a href="/register" class="orange-btn px-4 py-2 rounded-xl text-sm font-semibold shadow-sm inline-flex items-center gap-1.5">
                    <span>Coba Gratis</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>
            </div>
        </div>
    </nav>
"@
}

function Get-FooterHtml {
    return @"
    <footer class="bg-white border-t border-slate-200/80 mt-auto pt-16 pb-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
                <div class="space-y-4">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm">
                            <i data-lucide="wallet-cards" class="w-4 h-4"></i>
                        </div>
                        <span class="text-xl font-bold tracking-tight text-slate-900">Tata<span class="text-brand-500">Dana</span></span>
                    </div>
                    <p class="text-sm text-slate-500 leading-relaxed">
                        Catat keuangan semudah chat — langsung dari Telegram kamu. Terintegrasi penuh dengan AI dan sistem pelaporan realtime.
                    </p>
                    <div class="flex items-center gap-3 text-slate-400">
                        <a href="#" class="p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-500 transition-colors"><i data-lucide="send" class="w-4 h-4"></i></a>
                        <a href="#" class="p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-500 transition-colors"><i data-lucide="instagram" class="w-4 h-4"></i></a>
                        <a href="#" class="p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-500 transition-colors"><i data-lucide="twitter" class="w-4 h-4"></i></a>
                        <a href="#" class="p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-500 transition-colors"><i data-lucide="github" class="w-4 h-4"></i></a>
                    </div>
                </div>

                <div>
                    <h4 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Produk</h4>
                    <ul class="space-y-2.5 text-sm text-slate-500">
                        <li><a href="/#fitur" class="hover:text-brand-500 transition-colors">Telegram Bot Finansial</a></li>
                        <li><a href="/dashboard/laporan" class="hover:text-brand-500 transition-colors">Laporan & Analisis</a></li>
                        <li><a href="/#fitur" class="hover:text-brand-500 transition-colors">AI Financial Advisor</a></li>
                        <li><a href="/#pricing" class="hover:text-brand-500 transition-colors">Paket Langganan</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Perusahaan</h4>
                    <ul class="space-y-2.5 text-sm text-slate-500">
                        <li><a href="#" class="hover:text-brand-500 transition-colors">Tentang Kami</a></li>
                        <li><a href="#" class="hover:text-brand-500 transition-colors">Karir</a></li>
                        <li><a href="#" class="hover:text-brand-500 transition-colors">Blog Edukasi Keuangan</a></li>
                        <li><a href="#" class="hover:text-brand-500 transition-colors">Panduan @BotFather</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Legal & Dukungan</h4>
                    <ul class="space-y-2.5 text-sm text-slate-500">
                        <li><a href="#" class="hover:text-brand-500 transition-colors">Kebijakan Privasi (/privacy)</a></li>
                        <li><a href="#" class="hover:text-brand-500 transition-colors">Syarat & Ketentuan (/terms)</a></li>
                        <li><a href="#" class="hover:text-brand-500 transition-colors">Keamanan Data Bank-Grade</a></li>
                        <li><a href="#" class="hover:text-brand-500 transition-colors">Kontak Bantuan WhatsApp</a></li>
                    </ul>
                </div>
            </div>

            <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <p>&copy; 2026 TataDana Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
                <div class="flex items-center gap-6">
                    <span class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Semua Sistem Beroperasi Normal (WIB)
                    </span>
                </div>
            </div>
        </div>
    </footer>
"@
}

# ==============================================================================
# LANDING PAGE (PART 7 - STRICT ORDER)
# ==============================================================================
function Get-LandingPageHtml {
    $nav = Get-NavbarHtml
    $footer = Get-FooterHtml
    
    $body = @"
    $nav

    <!-- HERO SECTION -->
    <section class="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <!-- Pre-headline badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200/80 shadow-sm text-xs md:text-sm font-semibold text-brand-600 mb-6 animate-bounce">
                <span>✨</span> Catat keuangan langsung dari Telegram
            </div>

            <!-- Headline (H1) -->
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6 max-w-4xl mx-auto">
                Gaji habis sebelum akhir bulan? Sudah saatnya kamu tahu <span class="gradient-orange-text">ke mana uangmu pergi.</span>
            </h1>

            <!-- Sub-headline -->
            <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
                <a href="/register" class="orange-btn px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 w-full sm:w-auto justify-center">
                    <span>Mulai Gratis Sekarang</span>
                    <i data-lucide="arrow-right" class="w-5 h-5"></i>
                </a>
                <a href="#demo" class="px-8 py-4 rounded-xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center transition-all">
                    <span>Lihat cara kerjanya</span>
                    <span class="text-brand-500">&rarr;</span>
                </a>
            </div>

            <!-- HERO VIDEO PLACEHOLDER (TODO: ganti dengan video asli demo interaktif Telegram ke Dashboard) -->
            <div class="max-w-4xl mx-auto relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-brand-500 to-amber-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div class="relative silver-card rounded-2xl overflow-hidden border border-slate-200 shadow-2xl p-2 bg-slate-900/90 text-white">
                    <div class="aspect-video w-full rounded-xl bg-slate-950 flex flex-col items-center justify-center relative p-8 border border-slate-800">
                        <div class="w-20 h-20 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mb-4 ring-8 ring-brand-500/10 cursor-pointer hover:scale-105 transition-transform">
                            <i data-lucide="play" class="w-8 h-8 fill-current translate-x-0.5"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-white">Demo Video: Ketik di Telegram & Otomatis Muncul di Dashboard</h3>
                        <p class="text-xs text-slate-400 mt-1">// TODO: ganti dengan video/demo asli produk setelah onboarding live</p>
                        <div class="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-800">
                            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>Live Preview Interaktif Tersedia di Bawah</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- PROBLEM AWARE SECTION -->
    <section class="py-20 bg-white border-y border-slate-200/60">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-14">
                <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Kenyataan Pahit</span>
                <h2 class="text-3xl font-extrabold text-slate-900 mt-3">Kenapa Mengatur Keuangan Selalu Gagal?</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <!-- Bullet 1 -->
                <div class="silver-card silver-card-hover p-8 rounded-2xl">
                    <div class="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
                        <i data-lucide="smartphone" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3">"Buka aplikasi keuangan? Nanti dulu deh..."</h3>
                    <p class="text-slate-600 text-sm leading-relaxed">
                        Aplikasi pencatat konvensional terlalu ribet: harus login, pilih form berlapis, cari kategori manual. Akhirnya malas dan terbengkalai.
                    </p>
                </div>

                <!-- Bullet 2 -->
                <div class="silver-card silver-card-hover p-8 rounded-2xl">
                    <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
                        <i data-lucide="help-circle" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3">"Kok uangnya habis ya? Padahal kayak tidak beli apa-apa"</h3>
                    <p class="text-slate-600 text-sm leading-relaxed">
                        Kebocoran kas kecil (kopi 25rb, parkir, ojek online) sering luput dicatat. Tiba-tiba di tanggal 20 saldo tabungan sudah kritis.
                    </p>
                </div>

                <!-- Bullet 3 -->
                <div class="silver-card silver-card-hover p-8 rounded-2xl">
                    <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-6">
                        <i data-lucide="calendar-x" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3">"Udah niat bikin budget, tapi seminggu lupa"</h3>
                    <p class="text-slate-600 text-sm leading-relaxed">
                        Budget cuma ditulis di catatan yang tidak pernah dilihat lagi. Tidak ada pengingat otomatis saat pengeluaran sudah mau jebol.
                    </p>
                </div>
            </div>

            <!-- TRANSISI SOLUSI -->
            <div class="silver-card rounded-2xl p-8 md:p-12 text-center bg-gradient-to-r from-orange-50/50 via-white to-amber-50/50 border border-brand-200">
                <p class="text-base md:text-lg font-semibold text-slate-700 mb-2">Bagaimana kalau mencatat keuangan semudah kirim pesan ke teman?</p>
                <h3 class="text-2xl md:text-4xl font-extrabold text-slate-900">
                    Introducing <span class="gradient-orange-text">TataDana</span> 🚀
                </h3>
                <p class="text-sm md:text-base text-slate-600 max-w-2xl mx-auto mt-3">
                    Solusi fintech otomatis: cukup chat Telegram menggunakan bahasa sehari-hari atau jepret struk belanjaan, sistem kami yang menganalisis dan membukukannya secara realtime.
                </p>
            </div>
        </div>
    </section>

    <!-- INTERACTIVE DASHBOARD & TELEGRAM BOT PREVIEW (DEMO) -->
    <section id="demo" class="py-20 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-14">
                <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Interaktif & Fungsional</span>
                <h2 class="text-3xl font-extrabold text-slate-900 mt-3">Coba Simulasi Chat Telegram Langsung</h2>
                <p class="text-slate-600 text-sm mt-2">Ketik perintah atau gunakan tombol cepat untuk melihat format balasan presisi TataDana</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <!-- TELEGRAM CHAT SIMULATOR (5 COLS) -->
                <div class="lg:col-span-5 silver-card rounded-2xl shadow-xl overflow-hidden border border-slate-300/80 bg-slate-900 text-white flex flex-col h-[620px]">
                    <!-- Chat Header -->
                    <div class="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white shadow">
                                <i data-lucide="bot" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm text-white">TataDana Assistant</h4>
                                <div class="flex items-center gap-1.5 text-xs text-emerald-400">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>bot verified &bull; WIB (Asia/Jakarta)</span>
                                </div>
                            </div>
                        </div>
                        <span class="text-xs text-slate-400 px-2 py-1 bg-slate-700/60 rounded">@tatadana_bot</span>
                    </div>

                    <!-- Chat Body -->
                    <div id="chatMessages" class="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono bg-slate-950/80">
                        <!-- Welcome message -->
                        <div class="flex gap-2">
                            <div class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-1">🤖</div>
                            <div class="bg-slate-800 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 max-w-[85%] border border-slate-700 leading-relaxed whitespace-pre-line">
Halo! Saya bot TataDana. Kirim transaksi dengan bahasa santai, foto struk, atau voice note!
Contoh:
&bull; <code>beli bakso 15rb</code>
&bull; <code>gajian 5jt</code>
&bull; <code>/saldo</code> atau <code>/budget</code>
                            </div>
                        </div>
                    </div>

                    <!-- Quick buttons -->
                    <div class="p-2.5 bg-slate-800/80 border-t border-slate-700 flex items-center gap-2 overflow-x-auto text-[11px]">
                        <button onclick="sendSimulatedChat('beli bakso 15rb')" class="px-2.5 py-1 rounded bg-slate-700 hover:bg-brand-600 transition text-slate-200 shrink-0">🍜 beli bakso 15rb</button>
                        <button onclick="sendSimulatedChat('gajian 5jt')" class="px-2.5 py-1 rounded bg-slate-700 hover:bg-brand-600 transition text-slate-200 shrink-0">💰 gajian 5jt</button>
                        <button onclick="sendSimulatedChat('/saldo')" class="px-2.5 py-1 rounded bg-slate-700 hover:bg-brand-600 transition text-slate-200 shrink-0">💳 /saldo</button>
                        <button onclick="sendSimulatedChat('/budget')" class="px-2.5 py-1 rounded bg-slate-700 hover:bg-brand-600 transition text-slate-200 shrink-0">📊 /budget</button>
                    </div>

                    <!-- Input Bar -->
                    <form onsubmit="handleChatSubmit(event)" class="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                        <input id="chatInput" type="text" placeholder="Ketik transaksi... (contoh: isi bensin 50rb)" class="flex-1 bg-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500 font-sans" />
                        <button type="submit" class="orange-btn p-2.5 rounded-xl text-white">
                            <i data-lucide="send" class="w-4 h-4"></i>
                        </button>
                    </form>
                </div>

                <!-- LIVE DASHBOARD PREVIEW (7 COLS) -->
                <div class="lg:col-span-7 silver-card rounded-2xl p-6 shadow-xl border border-slate-200 bg-white">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                        <div>
                            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview Real-time</span>
                            <h3 class="text-lg font-bold text-slate-900">Dashboard Keuangan Pribadi</h3>
                        </div>
                        <a href="/dashboard" class="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200">
                            Buka Dashboard Lengkap <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                        </a>
                    </div>

                    <!-- 4 Mini Stat Cards -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[11px] font-medium text-slate-500">Saldo Total</span>
                            <p class="text-sm sm:text-base font-extrabold text-slate-900 mt-1">Rp20.585.000</p>
                        </div>
                        <div class="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                            <span class="text-[11px] font-medium text-emerald-700">Pemasukan Bln Ini</span>
                            <p class="text-sm sm:text-base font-extrabold text-emerald-700 mt-1">Rp22.700.000</p>
                        </div>
                        <div class="p-3 rounded-xl bg-orange-50/60 border border-orange-100">
                            <span class="text-[11px] font-medium text-brand-700">Pengeluaran Bln Ini</span>
                            <p class="text-sm sm:text-base font-extrabold text-brand-700 mt-1">Rp6.370.000</p>
                        </div>
                        <div class="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                            <span class="text-[11px] font-medium text-blue-700">Budget Sisa</span>
                            <p class="text-sm sm:text-base font-extrabold text-blue-700 mt-1">Rp4.130.000</p>
                        </div>
                    </div>

                    <!-- Mini Chart & Recent Transaksi -->
                    <div class="space-y-4">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>Transaksi Terakhir (Update Otomatis dari Bot)</span>
                            <span class="text-emerald-600 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Supabase Realtime</span>
                        </div>

                        <div class="space-y-2 text-xs">
                            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-100">
                                <div class="flex items-center gap-3">
                                    <span class="text-xl">🍜</span>
                                    <div>
                                        <p class="font-bold text-slate-900">Makan siang bakso solo + es teh</p>
                                        <span class="text-[11px] text-slate-500">13 Okt 13:45 &bull; BCA &bull; via Telegram</span>
                                    </div>
                                </div>
                                <span class="font-extrabold text-brand-600">-Rp45.000</span>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-100">
                                <div class="flex items-center gap-3">
                                    <span class="text-xl">🚗</span>
                                    <div>
                                        <p class="font-bold text-slate-900">Isi bensin Pertamax</p>
                                        <span class="text-[11px] text-slate-500">13 Okt 09:15 &bull; GoPay &bull; Voice Note (AI STT)</span>
                                    </div>
                                </div>
                                <span class="font-extrabold text-brand-600">-Rp150.000</span>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-100">
                                <div class="flex items-center gap-3">
                                    <span class="text-xl">💰</span>
                                    <div>
                                        <p class="font-bold text-slate-900">Gaji bulanan Oktober</p>
                                        <span class="text-[11px] text-slate-500">01 Okt 08:00 &bull; BCA &bull; Pemasukan</span>
                                    </div>
                                </div>
                                <span class="font-extrabold text-emerald-600">+Rp18.500.000</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FITUR UTAMA SECTION (3 FITUR ALTERNATING LAYOUT) -->
    <section id="fitur" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
            
            <!-- Fitur 1: Catat via Telegram -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div class="space-y-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 border border-brand-200">Fitur 01</span>
                    <h3 class="text-3xl font-extrabold text-slate-900">Catat via Telegram (Teks, Foto Struk, & Voice Note)</h3>
                    <p class="text-slate-600 text-sm leading-relaxed">
                        Cukup kirim pesan natural seperti "ngopi 25rb" atau rekam voice note saat menyetir. Parsing LLM kami mengenali nominal khas Indonesia (15rb, 1.5jt, 500k) secara akurat tanpa regex kaku.
                    </p>
                    <ul class="space-y-2 text-sm text-slate-700">
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> Parsing Natural Language dengan Structured Output JSON</li>
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> AI Vision OCR untuk ekstraksi struk belanja multi-item</li>
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> Transkripsi Voice Note cerdas berdurasi hingga 60 detik</li>
                    </ul>
                </div>
                <div class="silver-card p-6 rounded-2xl shadow-lg border border-slate-200 bg-slate-50">
                    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm font-mono text-xs text-slate-700 space-y-2">
                        <div class="text-slate-400">📅 Selasa, 13 Oktober 2026 — 14:20 WIB</div>
                        <div class="text-brand-600 font-bold">💸 Pengeluaran tercatat!</div>
                        <div>├ Nominal : Rp15.000</div>
                        <div>├ Kategori : 🍜 Makanan & Minuman</div>
                        <div>├ Dompet  : 👛 BCA</div>
                        <div>├ Catatan : beli bakso</div>
                        <div>└ Saldo   : Rp14.500.000</div>
                        <div class="pt-2 text-slate-500">📊 Budget Makanan bulan ini:</div>
                        <div class="text-brand-600 font-bold">[███████░░░] 71% — sisa Rp850.000</div>
                    </div>
                </div>
            </div>

            <!-- Fitur 2: Laporan & Export Otomatis -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div class="order-2 md:order-1 silver-card p-6 rounded-2xl shadow-lg border border-slate-200 bg-slate-50">
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div class="flex items-center justify-between border-b pb-3">
                            <span class="font-bold text-sm text-slate-900">Laporan Keuangan Bulanan</span>
                            <span class="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold">Siap Export</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="p-2.5 bg-slate-50 rounded">Net Cashflow: <span class="font-bold text-emerald-600">+Rp16.330.000</span></div>
                            <div class="p-2.5 bg-slate-50 rounded">Transaksi: <span class="font-bold text-slate-900">48 Tercatat</span></div>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <a href="/api/export/pdf" class="flex-1 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold text-center hover:bg-slate-800 transition flex items-center justify-center gap-1.5">
                                <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Download PDF
                            </a>
                            <a href="/api/export/excel" class="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center hover:bg-emerald-700 transition flex items-center justify-center gap-1.5">
                                <i data-lucide="sheet" class="w-3.5 h-3.5"></i> Download Excel
                            </a>
                        </div>
                    </div>
                </div>
                <div class="order-1 md:order-2 space-y-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 border border-brand-200">Fitur 02</span>
                    <h3 class="text-3xl font-extrabold text-slate-900">Laporan Native & Export PDF / Excel Instan</h3>
                    <p class="text-slate-600 text-sm leading-relaxed">
                        Semua data transaksi tersimpan 100% di Supabase Postgres. Pantau tabel transaksi lengkap dengan filter kategori, wallet, rentang tanggal, hingga rincian foto struk belanja yang bisa di-expand.
                    </p>
                    <ul class="space-y-2 text-sm text-slate-700">
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> Generate laporan on-demand dalam hitungan detik</li>
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> Disimpan privat dengan Signed URL aman yang otomatis expire</li>
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> Riwayat export tersimpan, unduh kapan saja tanpa generate ulang</li>
                    </ul>
                </div>
            </div>

            <!-- Fitur 3: AI Financial Advisor -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div class="space-y-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 border border-brand-200">Fitur 03</span>
                    <h3 class="text-3xl font-extrabold text-slate-900">AI Financial Advisor Pro (Otomatis & Proaktif)</h3>
                    <p class="text-slate-600 text-sm leading-relaxed">
                        Penasihat keuangan pribadi Anda yang selalu siaga. Tanpa perlu dipanggil manual, AI mendeteksi anomali pengeluaran dan memberikan saran konkret sebelum keuangan Anda boncos.
                    </p>
                    <ul class="space-y-2 text-sm text-slate-700">
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> Alert instan jika pengeluaran kategori melonjak >50% dari minggu lalu</li>
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> Peringatan saat rasio pengeluaran sudah >80% dari pemasukan bulanan</li>
                        <li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-4 h-4 text-brand-500"></i> Rekomendasi alokasi dana darurat & tabungan otomatis</li>
                    </ul>
                </div>
                <div class="silver-card p-6 rounded-2xl shadow-lg border border-slate-200 bg-slate-50">
                    <div class="p-4 bg-white rounded-xl border border-brand-200 shadow-sm text-xs space-y-2">
                        <div class="flex items-center gap-2 text-brand-600 font-bold text-sm">
                            <i data-lucide="sparkles" class="w-4 h-4"></i> AI Financial Advisor
                        </div>
                        <p class="text-slate-700 leading-relaxed">
                            "Hei Budi! Pengeluaran kategori <strong>Makanan & Minuman</strong> kamu minggu ini naik <strong>62%</strong> dibanding minggu lalu, terutama dari pesan antar makanan online."
                        </p>
                        <div class="p-2.5 rounded bg-amber-50 text-amber-800 text-[11px] border border-amber-200">
                            💡 <strong>Saran:</strong> Sisakan budget makan Rp850.000 untuk 18 hari ke depan dengan membatasi pesan antar maksimal 2x seminggu agar cashflow tetap aman.
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- TESTIMONI (MASONRY GRID - PLACEHOLDER DITANDAI JELAS) -->
    <!-- TODO: ganti dengan testimoni asli dari beta tester setelah fase launching publik -->
    <section class="py-20 bg-slate-50 border-y border-slate-200/80">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-14">
                <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Pengalaman Pengguna</span>
                <h2 class="text-3xl font-extrabold text-slate-900 mt-3">Kata Mereka yang Sudah Pegang Kendali Uang</h2>
                <p class="text-xs text-slate-400 mt-1">// TODO: ganti testimoni placeholder dengan testimoni asli user TataDana</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="silver-card p-6 rounded-2xl shadow-sm">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">AR</div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-900">Aris Munandar</h4>
                            <span class="text-xs text-slate-500">Software Engineer &bull; Jakarta</span>
                        </div>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        "Dulu malas banget buka app pencatat keuangan. Di TataDana, habis bayar kopi tinggal ketik 2 kata di Telegram, langsung masuk dashboard. Baru kali ini bisa konsisten catat selama 3 bulan penuh!"
                    </p>
                </div>

                <div class="silver-card p-6 rounded-2xl shadow-sm">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700">DN</div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-900">Dina Novita</h4>
                            <span class="text-xs text-slate-500">Freelance Designer &bull; Bandung</span>
                        </div>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        "Fitur scan struk fotonya juara! Belanja bulanan di supermarket yang isinya belasan item langsung dipisah kategorinya secara otomatis. Export laporan ke Excel juga rapi banget untuk kalkulasi pajak tahunan."
                    </p>
                </div>

                <div class="silver-card p-6 rounded-2xl shadow-sm">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">RP</div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-900">Rendi Pratama</h4>
                            <span class="text-xs text-slate-500">Karyawan Swasta &bull; Surabaya</span>
                        </div>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        "Budget alert di Telegram sangat ngebantu ngerem nafsu jajan. Waktu budget nongkrong udah 80%, bot langsung kasih reminder santai tapi mengena. Sekarang gaji bulanan selalu ada sisa untuk tabungan."
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- PRICING SECTION -->
    <section id="pricing" class="py-20 bg-white">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-14">
                <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Investasi Cerdas</span>
                <h2 class="text-3xl font-extrabold text-slate-900 mt-3">Pilihan Paket Transparan</h2>
                <p class="text-slate-600 text-sm mt-2">Mulai kendalikan arus kas tanpa biaya tersembunyi</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <!-- Starter Plan -->
                <div class="silver-card p-8 rounded-2xl flex flex-col justify-between border border-slate-200">
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-slate-900">Starter</h3>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Bulanan</span>
                        </div>
                        <div class="mb-6">
                            <span class="text-4xl font-extrabold text-slate-900">Rp49.000</span>
                            <span class="text-xs text-slate-500"> / bulan</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-6 pb-6 border-b border-slate-100">
                            Cocok untuk mahasiswa dan individu yang ingin memulai kebiasaan mencatat keuangan tanpa repot.
                        </p>
                        <ul class="space-y-3 text-xs text-slate-700">
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Catat transaksi via teks Telegram & Voice Note</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Maksimal 50 transaksi / bulan</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Maksimal 3 dompet / wallet</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Maksimal 5 kategori budget</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Dashboard web lengkap & ringkasan bulanan</li>
                            <li class="flex items-center gap-2 text-slate-400"><i data-lucide="x" class="w-4 h-4 text-slate-300"></i> Tanpa input foto struk</li>
                            <li class="flex items-center gap-2 text-slate-400"><i data-lucide="x" class="w-4 h-4 text-slate-300"></i> Tanpa AI Financial Advisor & Export PDF/Excel</li>
                        </ul>
                    </div>
                    <div class="mt-8">
                        <a href="/register?plan=starter" class="block w-full py-3 rounded-xl text-center text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition">
                            Pilih Paket Starter
                        </a>
                    </div>
                </div>

                <!-- Pro Plan (Featured) -->
                <div class="silver-card p-8 rounded-2xl flex flex-col justify-between border-2 border-brand-500 relative shadow-xl shadow-brand-500/10">
                    <div class="absolute -top-3.5 right-6 bg-gradient-to-r from-brand-600 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
                        PALING POPULER &bull; SEKALI BAYAR
                    </div>
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-slate-900">Pro Lifetime</h3>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200">Akses Selamanya</span>
                        </div>
                        <div class="mb-6">
                            <span class="text-4xl font-extrabold text-slate-900">Rp99.000</span>
                            <span class="text-xs text-slate-500"> / sekali bayar</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-6 pb-6 border-b border-slate-100">
                            Pilihan utama profesional dan keluarga untuk otomasi finansial tanpa batas dan analitik mendalam.
                        </p>
                        <ul class="space-y-3 text-xs text-slate-700">
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-brand-500"></i> <strong>Unlimited</strong> transaksi setiap bulan</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-brand-500"></i> <strong>Unlimited</strong> wallet & kategori custom</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-brand-500"></i> <strong>Input foto struk AI OCR</strong> (multi-item belanja)</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-brand-500"></i> <strong>Export unlimited ke PDF & Excel (.xlsx)</strong></li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-brand-500"></i> <strong>AI Financial Advisor Proaktif</strong> aktif 24/7</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-brand-500"></i> Reminder keuangan harian custom</li>
                            <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-brand-500"></i> Prioritas support pelanggan via WhatsApp</li>
                        </ul>
                    </div>
                    <div class="mt-8">
                        <a href="/register?plan=pro" class="orange-btn block w-full py-3.5 rounded-xl text-center text-sm font-bold shadow-md">
                            Dapatkan Akses Pro Sekarang
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ SECTION (MINIMAL 7 PERTANYAAN) -->
    <section id="faq" class="py-20 bg-slate-50 border-t border-slate-200/80">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-14">
                <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Bantuan & FAQ</span>
                <h2 class="text-3xl font-extrabold text-slate-900 mt-3">Pertanyaan yang Sering Diajukan</h2>
            </div>

            <div class="space-y-4 text-sm">
                <!-- Q1 -->
                <div class="silver-card p-5 rounded-2xl">
                    <h4 class="font-bold text-slate-900 mb-2">1. Apakah 1 bot Telegram digunakan bersama atau 1 bot per user?</h4>
                    <p class="text-slate-600 text-xs leading-relaxed">
                        Satu bot resmi TataDana digunakan bersama oleh seluruh pengguna. Sistem mengenali identitas Anda berdasarkan nomor handphone yang diverifikasi atau Telegram Chat ID unik yang tertaut saat setup akun.
                    </p>
                </div>

                <!-- Q2 -->
                <div class="silver-card p-5 rounded-2xl">
                    <h4 class="font-bold text-slate-900 mb-2">2. Apakah bisa pakai foto struk di paket Starter?</h4>
                    <p class="text-slate-600 text-xs leading-relaxed">
                        Input foto struk dengan AI Vision OCR adalah fitur eksklusif untuk paket Pro. Di paket Starter, bot akan membalas dengan penjelasan ramah dan tombol upgrade jika Anda mengirimkan gambar struk.
                    </p>
                </div>

                <!-- Q3 -->
                <div class="silver-card p-5 rounded-2xl">
                    <h4 class="font-bold text-slate-900 mb-2">3. Bagaimana keamanan data transaksi saya di TataDana?</h4>
                    <p class="text-slate-600 text-xs leading-relaxed">
                        100% data transaksi dan profil disimpan di database Supabase Postgres terenkripsi dengan Row Level Security (RLS). Token bot dan API disimpan terenkripsi secara asimetris, dan admin hanya dapat melihat ringkasan dengan audit log ketat.
                    </p>
                </div>

                <!-- Q4 -->
                <div class="silver-card p-5 rounded-2xl">
                    <h4 class="font-bold text-slate-900 mb-2">4. Bagaimana cara bot mengenali nominal seperti "15rb", "1.5jt", atau "500k"?</h4>
                    <p class="text-slate-600 text-xs leading-relaxed">
                        TataDana menggunakan pipeline LLM berstandar industri dengan structured output yang telah dioptimasi untuk bahasa gaul dan singkatan mata uang Indonesia.
                    </p>
                </div>

                <!-- Q5 -->
                <div class="silver-card p-5 rounded-2xl">
                    <h4 class="font-bold text-slate-900 mb-2">5. Metode pembayaran apa saja yang didukung?</h4>
                    <p class="text-slate-600 text-xs leading-relaxed">
                        Kami mendukung pembayaran otomatis melalui gateway Midtrans (QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri/BRI) serta opsi transfer manual dengan verifikasi bukti transfer oleh admin.
                    </p>
                </div>

                <!-- Q6 -->
                <div class="silver-card p-5 rounded-2xl">
                    <h4 class="font-bold text-slate-900 mb-2">6. Apakah zona waktu transaksi menggunakan WIB?</h4>
                    <p class="text-slate-600 text-xs leading-relaxed">
                        Ya, 100% timestamp pencatatan, reply bot, reminder harian, dan export laporan menggunakan zona waktu Indonesia Barat (WIB, Asia/Jakarta / UTC+7).
                    </p>
                </div>

                <!-- Q7 -->
                <div class="silver-card p-5 rounded-2xl">
                    <h4 class="font-bold text-slate-900 mb-2">7. Bagaimana jika bot menerima pesan berulang (retry Telegram)?</h4>
                    <p class="text-slate-600 text-xs leading-relaxed">
                        Endpoint webhook TataDana menerapkan sistem idempotency. Setiap <code>update_id</code> Telegram diverifikasi terlebih dahulu; jika sudah pernah diproses, sistem otomatis melewati pesan tersebut sehingga transaksi Anda tidak akan pernah tercatat dobel.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- FINAL CTA SECTION -->
    <section class="py-20 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 text-white relative overflow-hidden">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Mulai kendalikan keuanganmu hari ini.
            </h2>
            <p class="text-base sm:text-lg text-orange-100 max-w-xl mx-auto">
                Hanya butuh 2 menit untuk menghubungkan Telegram dan membuat dompet pertamamu. Bebas ribet, gratis untuk dicoba.
            </p>
            <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/register" class="px-8 py-4 rounded-xl text-base font-bold bg-white text-brand-600 hover:bg-orange-50 shadow-xl transition-all">
                    Daftar Sekarang &bull; Bebas Biaya
                </a>
                <a href="/login" class="px-8 py-4 rounded-xl text-base font-bold text-white border border-white/30 hover:bg-white/10 transition-all">
                    Masuk ke Akun Saya
                </a>
            </div>
        </div>
    </section>

    $footer

    <script>
        function sendSimulatedChat(text) {
            document.getElementById('chatInput').value = text;
            handleChatSubmit(new Event('submit'));
        }

        async function handleChatSubmit(e) {
            e.preventDefault();
            const input = document.getElementById('chatInput');
            const val = input.value.trim();
            if (!val) return;

            const box = document.getElementById('chatMessages');
            
            // Add user message
            const userBubble = document.createElement('div');
            userBubble.className = 'flex justify-end';
            userBubble.innerHTML = '<div class="bg-brand-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] whitespace-pre-line">' + val + '</div>';
            box.appendChild(userBubble);
            input.value = '';
            box.scrollTop = box.scrollHeight;

            // Loading bubble
            const loadingBubble = document.createElement('div');
            loadingBubble.className = 'flex gap-2';
            loadingBubble.innerHTML = '<div class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-1">🤖</div>' +
                '<div class="bg-slate-800 p-3 rounded-2xl rounded-tl-sm text-slate-400 text-xs flex items-center gap-2 border border-slate-700">' +
                '<span class="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span> TataDana AI sedang memproses...</div>';
            box.appendChild(loadingBubble);
            box.scrollTop = box.scrollHeight;

            try {
                const res = await fetch('/api/telegram/webhook', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        update_id: Math.floor(Math.random() * 900000) + 100000,
                        message: {
                            chat: { id: 12948201 },
                            from: { username: 'budi_demo' },
                            text: val
                        }
                    })
                });
                const data = await res.json();
                box.removeChild(loadingBubble);

                const replyBubble = document.createElement('div');
                replyBubble.className = 'flex gap-2';
                replyBubble.innerHTML = '<div class="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-1">🤖</div>' +
                    '<div class="bg-slate-800 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 max-w-[85%] border border-slate-700 whitespace-pre-line leading-relaxed">' +
                    (data.reply || 'Transaksi berhasil diproses.') + '</div>';
                box.appendChild(replyBubble);
                box.scrollTop = box.scrollHeight;
            } catch (err) {
                box.removeChild(loadingBubble);
            }
        }
    </script>
"@

    return Get-HtmlTemplate "Aplikasi Keuangan Chat Telegram" $body "home"
}

# ==============================================================================
# AUTH PAGES: LOGIN & REGISTER (PART 8 - SPLIT LAYOUT 40/60)
# ==============================================================================
function Get-LoginPageHtml {
    $content = @"
    <div class="min-h-screen flex flex-col md:flex-row">
        <!-- KIRI (40%): Branding Panel -->
        <div class="hidden md:flex md:w-2/5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden border-r border-slate-800">
            <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div>
                <a href="/" class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                        <i data-lucide="wallet-cards" class="w-5 h-5"></i>
                    </div>
                    <span class="text-2xl font-bold tracking-tight text-white">Tata<span class="text-brand-500">Dana</span></span>
                </a>
            </div>

            <div class="space-y-4">
                <span class="text-xs font-bold text-brand-400 uppercase tracking-widest bg-brand-950/60 px-3 py-1 rounded-full border border-brand-800/60">Fintech Platform</span>
                <h2 class="text-4xl font-extrabold tracking-tight leading-tight">Keuanganmu.<br/><span class="gradient-orange-text">Terkontrol.</span></h2>
                <p class="text-sm text-slate-400 leading-relaxed max-w-sm">
                    Kemudahan mencatat pengeluaran secepat kirim pesan Telegram. Dilengkapi analitik cerdas & laporan keuangan profesional.
                </p>
            </div>

            <div class="text-xs text-slate-500">
                &copy; 2026 TataDana Indonesia. Enkripsi Bank-Grade &bull; Supabase Auth.
            </div>
        </div>

        <!-- KANAN (60%): Form Login -->
        <div class="w-full md:w-3/5 bg-white flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12">
            <div class="max-w-md w-full mx-auto space-y-8">
                <!-- Mobile brand icon -->
                <div class="md:hidden flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                        <i data-lucide="wallet-cards" class="w-4 h-4"></i>
                    </div>
                    <span class="text-xl font-bold text-slate-900">Tata<span class="text-brand-500">Dana</span></span>
                </div>

                <div>
                    <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Masuk ke Akun Anda</h2>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">Pilih metode masuk yang Anda sukai di bawah ini.</p>
                </div>

                <!-- Google OAuth -->
                <button onclick="window.location.href='/dashboard'" class="w-full py-3 px-4 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 transition shadow-sm">
                    <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.35 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 4.9 12c0-.78.14-1.54.37-2.24V6.61H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l4.02-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                    <span>Masuk dengan Google</span>
                </button>

                <div class="relative flex items-center justify-center">
                    <div class="border-t border-slate-200 w-full"></div>
                    <span class="bg-white px-3 text-xs text-slate-400 absolute uppercase">atau email / no hp</span>
                </div>

                <!-- Form -->
                <form onsubmit="handleLogin(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email atau Nomor Handphone</label>
                        <input id="loginIdentifier" type="text" required value="budi@tatadana.id" placeholder="nama@email.com atau 081234567890" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition" />
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="block text-xs font-bold text-slate-700 uppercase">Kata Sandi</label>
                            <a href="#" class="text-xs text-brand-600 hover:text-brand-700 font-semibold">Lupa kata sandi?</a>
                        </div>
                        <input type="password" required value="rahasia123" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition" />
                    </div>

                    <button type="submit" class="orange-btn w-full py-3.5 rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 mt-2">
                        Masuk ke Dashboard
                    </button>
                </form>

                <p class="text-center text-xs text-slate-500">
                    Belum punya akun TataDana?
                    <a href="/register" class="font-bold text-brand-600 hover:text-brand-700">Daftar sekarang</a>
                </p>
            </div>
        </div>
    </div>

    <script>
        function handleLogin(e) {
            e.preventDefault();
            window.location.href = '/dashboard';
        }
    </script>
"@

    return Get-HtmlTemplate "Masuk ke TataDana" $content "login"
}

function Get-RegisterPageHtml {
    $content = @"
    <div class="min-h-screen flex flex-col md:flex-row">
        <!-- KIRI (40%): Branding Panel -->
        <div class="hidden md:flex md:w-2/5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden border-r border-slate-800">
            <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div>
                <a href="/" class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                        <i data-lucide="wallet-cards" class="w-5 h-5"></i>
                    </div>
                    <span class="text-2xl font-bold tracking-tight text-white">Tata<span class="text-brand-500">Dana</span></span>
                </a>
            </div>

            <div class="space-y-4">
                <span class="text-xs font-bold text-brand-400 uppercase tracking-widest bg-brand-950/60 px-3 py-1 rounded-full border border-brand-800/60">Pendaftaran Akun</span>
                <h2 class="text-4xl font-extrabold tracking-tight leading-tight">Mulai Otomasi<br/><span class="gradient-orange-text">Finansialmu.</span></h2>
                <p class="text-sm text-slate-400 leading-relaxed max-w-sm">
                    Verifikasi nomor HP Anda untuk langsung menghubungkan akun ke bot Telegram resmi TataDana.
                </p>
            </div>

            <div class="text-xs text-slate-500">
                &copy; 2026 TataDana Indonesia. Enkripsi Bank-Grade &bull; Supabase Auth.
            </div>
        </div>

        <!-- KANAN (60%): Form Register & OTP Step -->
        <div class="w-full md:w-3/5 bg-white flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12">
            <div class="max-w-md w-full mx-auto space-y-6">
                <div>
                    <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Buat Akun TataDana</h2>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">Daftar sekarang untuk akses penuh ke dashboard dan bot.</p>
                </div>

                <form id="regForm" onsubmit="handleSendOtp(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nama Lengkap</label>
                        <input id="regName" type="text" required placeholder="Budi Pratama" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition" />
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email</label>
                        <input id="regEmail" type="email" required placeholder="budi@example.com" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition" />
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                            Nomor WhatsApp / HP <span class="text-brand-600 font-normal">(Kunci Link Telegram)</span>
                        </label>
                        <div class="flex gap-2">
                            <span class="px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-300 text-sm font-semibold text-slate-600 flex items-center">+62</span>
                            <input id="regPhone" type="tel" required placeholder="81234567890" class="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Kata Sandi</label>
                        <input type="password" required placeholder="Minimal 8 karakter" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition" />
                    </div>

                    <button type="submit" class="orange-btn w-full py-3.5 rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 mt-2">
                        Kirim Kode OTP Verifikasi
                    </button>
                </form>

                <!-- OTP Modal -->
                <div id="otpModal" class="hidden p-6 rounded-2xl bg-slate-50 border border-brand-200 space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                            <i data-lucide="key" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-900">Verifikasi Nomor HP</h4>
                            <p class="text-xs text-slate-500">Kode OTP simulasi telah dikirim ke WhatsApp Anda: <strong class="text-brand-600">749102</strong></p>
                        </div>
                    </div>

                    <div class="flex gap-2 justify-center py-2">
                        <input type="text" maxlength="6" value="749102" class="text-center font-mono text-xl tracking-widest px-4 py-3 rounded-xl border border-brand-300 bg-white font-bold text-slate-900 w-48 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>

                    <button onclick="handleVerifyOtp()" class="orange-btn w-full py-3 rounded-xl text-xs font-bold">
                        Verifikasi & Masuk ke Dashboard
                    </button>
                </div>

                <p class="text-center text-xs text-slate-500">
                    Sudah memiliki akun?
                    <a href="/login" class="font-bold text-brand-600 hover:text-brand-700">Masuk di sini</a>
                </p>
            </div>
        </div>
    </div>

    <script>
        function handleSendOtp(e) {
            e.preventDefault();
            document.getElementById('otpModal').classList.remove('hidden');
        }
        function handleVerifyOtp() {
            window.location.href = '/dashboard';
        }
    </script>
"@

    return Get-HtmlTemplate "Daftar Akun Baru" $content "register"
}

# ==============================================================================
# USER DASHBOARD (BERANDA, TRANSAKSI, LAPORAN, BUDGET, WALLET, SETTINGS)
# ==============================================================================
function Get-DashboardSidebar($active = "beranda") {
    $planBadge = if ($global:state.user.plan -eq "pro") {
        '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-sm">PRO USER</span>'
    } else {
        '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">STARTER</span>'
    }

    $links = @(
        @{ id="beranda"; label="Beranda"; icon="home"; href="/dashboard" },
        @{ id="transaksi"; label="Transaksi"; icon="credit-card"; href="/dashboard/transaksi" },
        @{ id="laporan"; label="Laporan"; icon="bar-chart-3"; href="/dashboard/laporan" },
        @{ id="budget"; label="Budget"; icon="target"; href="/dashboard/budget" },
        @{ id="wallet"; label="Wallet"; icon="wallet"; href="/dashboard/wallet" },
        @{ id="settings"; label="Settings"; icon="settings"; href="/dashboard/settings" }
    )

    $navItems = ""
    foreach ($item in $links) {
        $isActive = $item.id -eq $active
        $class = if ($isActive) {
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm bg-brand-500 text-white shadow-md shadow-brand-500/25 transition-all"
        } else {
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
        }
        $navItems += @"
        <a href="$($item.href)" class="$class">
            <i data-lucide="$($item.icon)" class="w-4 h-4"></i>
            <span>$($item.label)</span>
        </a>
"@
    }

    return @"
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 min-h-screen shrink-0">
        <div class="space-y-6">
            <!-- Brand -->
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                <a href="/" class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm">
                        <i data-lucide="wallet-cards" class="w-4 h-4"></i>
                    </div>
                    <span class="text-xl font-bold tracking-tight text-slate-900">Tata<span class="text-brand-500">Dana</span></span>
                </a>
                $planBadge
            </div>

            <!-- Navigation Links -->
            <nav class="space-y-1.5">
                $navItems
            </nav>
        </div>

        <!-- User profile badge & logout -->
        <div class="pt-4 border-t border-slate-100 space-y-3">
            <div class="flex items-center gap-3 px-2">
                <div class="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    BP
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-900 truncate">$($global:state.user.name)</p>
                    <p class="text-[11px] text-slate-400 truncate">$($global:state.user.email)</p>
                </div>
            </div>

            <div class="flex items-center">
                <a href="/login" class="w-full py-2 text-center text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">
                    Keluar
                </a>
            </div>
        </div>
    </aside>
"@
}

# ==============================================================================
# DASHBOARD: BERANDA (OVERVIEW, STATS, CHARTS)
# ==============================================================================
function Get-DashboardHomeHtml {
    $sidebar = Get-DashboardSidebar "beranda"

    $content = @"
    <div class="flex min-h-screen bg-slate-50">
        $sidebar

        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
            <!-- Topbar Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-900">Beranda Keuangan</h1>
                    <p class="text-xs sm:text-sm text-slate-500">Halo, $($global:state.user.name) &bull; Waktu server: Asia/Jakarta (WIB)</p>
                </div>

                <div class="flex items-center gap-3">
                    <select class="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-500 shadow-sm">
                        <option>Bulan Ini (Oktober 2026)</option>
                        <option>Bulan Lalu (September 2026)</option>
                        <option>Tahun Ini (2026)</option>
                        <option>Custom Range</option>
                    </select>
                    <a href="/dashboard/transaksi" class="orange-btn px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5">
                        <i data-lucide="plus" class="w-3.5 h-3.5"></i> Catat Transaksi
                    </a>
                </div>
            </div>

            <!-- ONBOARDING CHECKLIST (IF USER HAS TASKS) -->
            <div class="silver-card p-5 rounded-2xl mb-8 border border-brand-200/80 bg-gradient-to-r from-orange-50/40 via-white to-amber-50/30">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
                        <i data-lucide="check-circle" class="w-4 h-4"></i> Onboarding Checklist
                    </span>
                    <span class="text-xs font-bold text-slate-500">2 dari 3 Selesai (66%)</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div class="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-emerald-200 text-emerald-800">
                        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                        <span>1. Hubungkan Telegram Bot (@tatadana_bot)</span>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-emerald-200 text-emerald-800">
                        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                        <span>2. Set Wallet Default (BCA)</span>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700">
                        <i data-lucide="circle" class="w-4 h-4 text-slate-300 shrink-0"></i>
                        <span><a href="/dashboard/budget" class="text-brand-600 font-bold hover:underline">3. Set Budget Bulanan Kategori &rarr;</a></span>
                    </div>
                </div>
            </div>

            <!-- 4 STATS CARDS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <!-- Saldo Total -->
                <div class="silver-card silver-card-hover p-5 rounded-2xl">
                    <div class="flex items-center justify-between text-slate-500 mb-2">
                        <span class="text-xs font-semibold">Saldo Total (4 Wallet)</span>
                        <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                            <i data-lucide="wallet" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <p class="text-2xl font-extrabold text-slate-900">Rp20.585.000</p>
                    <span class="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                        <i data-lucide="trending-up" class="w-3 h-3"></i> +12% dibanding bulan lalu
                    </span>
                </div>

                <!-- Pemasukan Bulan Ini -->
                <div class="silver-card silver-card-hover p-5 rounded-2xl">
                    <div class="flex items-center justify-between text-slate-500 mb-2">
                        <span class="text-xs font-semibold">Pemasukan Bulan Ini</span>
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <i data-lucide="arrow-down-left" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <p class="text-2xl font-extrabold text-emerald-600">Rp22.700.000</p>
                    <span class="text-[11px] text-slate-500 font-medium mt-1 block">Gaji pokok + Proyek freelance</span>
                </div>

                <!-- Pengeluaran Bulan Ini -->
                <div class="silver-card silver-card-hover p-5 rounded-2xl">
                    <div class="flex items-center justify-between text-slate-500 mb-2">
                        <span class="text-xs font-semibold">Pengeluaran Bulan Ini</span>
                        <div class="w-8 h-8 rounded-lg bg-orange-50 text-brand-600 flex items-center justify-center">
                            <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <p class="text-2xl font-extrabold text-brand-600">Rp6.370.000</p>
                    <span class="text-[11px] text-slate-500 font-medium mt-1 block">61% dari batas budget bulanan</span>
                </div>

                <!-- Budget Tersisa -->
                <div class="silver-card silver-card-hover p-5 rounded-2xl">
                    <div class="flex items-center justify-between text-slate-500 mb-2">
                        <span class="text-xs font-semibold">Budget Tersisa</span>
                        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <i data-lucide="target" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <p class="text-2xl font-extrabold text-blue-600">Rp4.130.000</p>
                    <span class="text-[11px] text-emerald-600 font-medium mt-1 block">Aman (tersisa 18 hari)</span>
                </div>
            </div>

            <!-- CHARTS SECTION -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                <!-- BAR CHART (8 COLS): Pemasukan vs Pengeluaran 6 Bulan -->
                <div class="lg:col-span-8 silver-card p-6 rounded-2xl">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="font-bold text-sm text-slate-900">Perbandingan Cashflow (6 Bulan Terakhir)</h3>
                            <p class="text-xs text-slate-500">Pemasukan vs Pengeluaran Bulanan</p>
                        </div>
                        <div class="flex items-center gap-4 text-xs">
                            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-emerald-500"></span> Pemasukan</span>
                            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-brand-500"></span> Pengeluaran</span>
                        </div>
                    </div>
                    <div class="h-64">
                        <canvas id="cashflowBarChart"></canvas>
                    </div>
                </div>

                <!-- PIE CHART (4 COLS): Pengeluaran per Kategori -->
                <div class="lg:col-span-4 silver-card p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-sm text-slate-900 mb-1">Kategori Pengeluaran</h3>
                        <p class="text-xs text-slate-500 mb-4">Breakdown bulan Oktober 2026</p>
                        <div class="h-52">
                            <canvas id="categoryPieChart"></canvas>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Top Kategori:</span>
                        <span class="font-bold text-slate-900">🍜 Makanan & Minuman (34%)</span>
                    </div>
                </div>
            </div>

            <!-- 10 TRANSAKSI TERBARU -->
            <div class="silver-card rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="font-bold text-sm text-slate-900">10 Transaksi Terbaru</h3>
                        <p class="text-xs text-slate-500">Update realtime via Supabase & Telegram Bot</p>
                    </div>
                    <a href="/dashboard/transaksi" class="text-xs font-bold text-brand-600 hover:text-brand-700">Lihat Semua &rarr;</a>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-400 font-bold uppercase">
                                <th class="pb-3">Tanggal / Waktu</th>
                                <th class="pb-3">Kategori</th>
                                <th class="pb-3">Catatan / Rincian</th>
                                <th class="pb-3">Dompet</th>
                                <th class="pb-3">Sumber</th>
                                <th class="pb-3 text-right">Nominal (IDR)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 font-medium">
                            <tr class="hover:bg-slate-50">
                                <td class="py-3 text-slate-500">13 Okt 13:45 WIB</td>
                                <td class="py-3 font-bold text-slate-900">🍜 Makanan & Minuman</td>
                                <td class="py-3 text-slate-700">Makan siang bakso solo + es teh</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">BCA</span></td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Telegram Chat</span></td>
                                <td class="py-3 text-right font-extrabold text-brand-600">-Rp45.000</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="py-3 text-slate-500">13 Okt 09:15 WIB</td>
                                <td class="py-3 font-bold text-slate-900">🚗 Transportasi</td>
                                <td class="py-3 text-slate-700">Isi bensin Pertamax</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-bold">GoPay</span></td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-purple-50 text-purple-700">🎙️ Voice Note</span></td>
                                <td class="py-3 text-right font-extrabold text-brand-600">-Rp150.000</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="py-3 text-slate-500">12 Okt 19:30 WIB</td>
                                <td class="py-3 font-bold text-slate-900">👕 Belanja Bulanan</td>
                                <td class="py-3 text-slate-700">Superindo supermarket (5 item struk)</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">BCA</span></td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700">📸 Struk OCR</span></td>
                                <td class="py-3 text-right font-extrabold text-brand-600">-Rp325.000</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="py-3 text-slate-500">10 Okt 14:00 WIB</td>
                                <td class="py-3 font-bold text-slate-900">🏠 Tagihan & Utilitas</td>
                                <td class="py-3 text-slate-700">Token listrik PLN & WiFi Indihome</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold">Mandiri</span></td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Web App</span></td>
                                <td class="py-3 text-right font-extrabold text-brand-600">-Rp850.000</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="py-3 text-slate-500">05 Okt 16:20 WIB</td>
                                <td class="py-3 font-bold text-emerald-700">💰 Gaji & Pemasukan</td>
                                <td class="py-3 text-slate-700">Proyek freelance UI/UX redesign</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold">Mandiri</span></td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Web App</span></td>
                                <td class="py-3 text-right font-extrabold text-emerald-600">+Rp4.200.000</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="py-3 text-slate-500">01 Okt 08:00 WIB</td>
                                <td class="py-3 font-bold text-emerald-700">💰 Gaji & Pemasukan</td>
                                <td class="py-3 text-slate-700">Gaji pokok bulanan Oktober</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">BCA</span></td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Telegram Chat</span></td>
                                <td class="py-3 text-right font-extrabold text-emerald-600">+Rp18.500.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Init Charts
        const ctxBar = document.getElementById('cashflowBarChart').getContext('2d');
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
                datasets: [
                    { label: 'Pemasukan', data: [18500000, 19200000, 18500000, 21000000, 19500000, 22700000], backgroundColor: '#10B981', borderRadius: 6 },
                    { label: 'Pengeluaran', data: [7200000, 6800000, 7500000, 8100000, 6900000, 6370000], backgroundColor: '#FF6B00', borderRadius: 6 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { ticks: { callback: v => 'Rp' + (v/1000000) + 'jt' } } }
            }
        });

        const ctxPie = document.getElementById('categoryPieChart').getContext('2d');
        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Makanan', 'Transport', 'Belanja', 'Tagihan', 'Lainnya'],
                datasets: [{
                    data: [2150000, 950000, 1650000, 2400000, 320000],
                    backgroundColor: ['#FF6B00', '#3B82F6', '#F59E0B', '#EC4899', '#10B981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
            }
        });
    </script>
"@

    return Get-HtmlTemplate "Dashboard Beranda" $content "beranda"
}

# ==============================================================================
# DASHBOARD: TRANSAKSI (CATAT PEMASUKAN, PENGELUARAN, TRANSFER)
# ==============================================================================
function Get-DashboardTransaksiHtml {
    $sidebar = Get-DashboardSidebar "transaksi"

    $content = @"
    <div class="flex min-h-screen bg-slate-50">
        $sidebar

        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-900">Catat Transaksi Manual</h1>
                    <p class="text-xs sm:text-sm text-slate-500">Pemasukan, pengeluaran, atau transfer antar dompet</p>
                </div>
            </div>

            <div class="max-w-2xl silver-card p-6 md:p-8 rounded-2xl bg-white shadow-md">
                <form onsubmit="handleQuickRecord(event)" class="space-y-5">
                    <!-- Tab Selector: Pengeluaran | Pemasukan | Transfer -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Jenis Transaksi</label>
                        <div class="grid grid-cols-3 gap-2">
                            <button type="button" onclick="setTxType('expense')" id="btnExpense" class="py-2.5 rounded-xl text-xs font-bold bg-brand-500 text-white shadow">💸 Pengeluaran</button>
                            <button type="button" onclick="setTxType('income')" id="btnIncome" class="py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">💰 Pemasukan</button>
                            <button type="button" onclick="setTxType('transfer')" id="btnTransfer" class="py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">🔄 Transfer</button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nominal (IDR)</label>
                        <div class="relative">
                            <span class="absolute left-4 top-3 text-slate-400 font-bold text-sm">Rp</span>
                            <input id="txAmount" type="number" required placeholder="50000" class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Kategori</label>
                            <select id="txCategory" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 bg-white">
                                <option>🍜 Makanan & Minuman</option>
                                <option>🚗 Transportasi</option>
                                <option>👕 Belanja Bulanan</option>
                                <option>🏠 Tagihan & Utilitas</option>
                                <option>🎮 Hiburan & Hobi</option>
                                <option>💊 Kesehatan</option>
                                <option>💰 Gaji & Pemasukan</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Dompet / Rekening</label>
                            <select id="txWallet" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 bg-white">
                                <option>BCA (Saldo: Rp14.500.000)</option>
                                <option>Mandiri (Saldo: Rp5.250.000)</option>
                                <option>GoPay (Saldo: Rp485.000)</option>
                                <option>Cash (Saldo: Rp350.000)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Catatan</label>
                        <input id="txNote" type="text" placeholder="Contoh: Beli kopi kenangan + roti" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500" />
                    </div>

                    <div id="transferTargetBox" class="hidden">
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Transfer ke Dompet Tujuan</label>
                        <select class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-500 bg-white">
                            <option>GoPay</option>
                            <option>Mandiri</option>
                            <option>Cash</option>
                        </select>
                    </div>

                    <button type="submit" class="orange-btn w-full py-3.5 rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 mt-4">
                        Simpan Transaksi
                    </button>
                </form>
            </div>
        </main>
    </div>

    <script>
        let currentTxType = 'expense';
        function setTxType(type) {
            currentTxType = type;
            document.getElementById('btnExpense').className = type === 'expense' ? 'py-2.5 rounded-xl text-xs font-bold bg-brand-500 text-white shadow' : 'py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700';
            document.getElementById('btnIncome').className = type === 'income' ? 'py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow' : 'py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700';
            document.getElementById('btnTransfer').className = type === 'transfer' ? 'py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow' : 'py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700';
            document.getElementById('transferTargetBox').classList.toggle('hidden', type !== 'transfer');
        }

        async function handleQuickRecord(e) {
            e.preventDefault();
            const amount = document.getElementById('txAmount').value;
            const category = document.getElementById('txCategory').value;
            const wallet = document.getElementById('txWallet').value;
            const note = document.getElementById('txNote').value;

            alert('Transaksi berhasil dicatat ke Supabase Postgres!');
            window.location.href = '/dashboard/laporan';
        }
    </script>
"@

    return Get-HtmlTemplate "Catat Transaksi" $content "transaksi"
}

# ==============================================================================
# DASHBOARD: LAPORAN (EXPORT PDF/EXCEL, FILTER, EXPANDABLE STRUK)
# ==============================================================================
function Get-DashboardLaporanHtml {
    $sidebar = Get-DashboardSidebar "laporan"

    $content = @"
    <div class="flex min-h-screen bg-slate-50">
        $sidebar

        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
            <!-- Header & Export Action Buttons -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-900">Laporan Keuangan & Export</h1>
                    <p class="text-xs sm:text-sm text-slate-500">Tabel lengkap, sortir, filter, dan download file PDF / Excel</p>
                </div>

                <div class="flex items-center gap-3">
                    <a href="/api/export/pdf" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="file-text" class="w-4 h-4"></i> Export PDF
                    </a>
                    <a href="/api/export/excel" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="sheet" class="w-4 h-4"></i> Export Excel (.csv)
                    </a>
                </div>
            </div>

            <!-- SUMMARY RINGKASAN PERIODE -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div class="silver-card p-5 rounded-2xl">
                    <span class="text-xs text-slate-500 font-semibold">Total Pemasukan</span>
                    <p class="text-xl font-extrabold text-emerald-600 mt-1">Rp22.700.000</p>
                </div>
                <div class="silver-card p-5 rounded-2xl">
                    <span class="text-xs text-slate-500 font-semibold">Total Pengeluaran</span>
                    <p class="text-xl font-extrabold text-brand-600 mt-1">Rp6.370.000</p>
                </div>
                <div class="silver-card p-5 rounded-2xl">
                    <span class="text-xs text-slate-500 font-semibold">Net Cashflow (Selisih)</span>
                    <p class="text-xl font-extrabold text-slate-900 mt-1">+Rp16.330.000</p>
                </div>
            </div>

            <!-- FILTER & SEARCH BAR -->
            <div class="silver-card p-4 rounded-2xl mb-6 flex flex-wrap items-center gap-3 bg-white">
                <div class="flex-1 min-w-[200px]">
                    <input type="text" placeholder="Cari catatan transaksi..." class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500" />
                </div>
                <select class="px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white">
                    <option>Semua Kategori</option>
                    <option>Makanan & Minuman</option>
                    <option>Transportasi</option>
                    <option>Belanja Bulanan</option>
                </select>
                <select class="px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white">
                    <option>Semua Dompet</option>
                    <option>BCA</option>
                    <option>Mandiri</option>
                    <option>GoPay</option>
                </select>
                <select class="px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white">
                    <option>Semua Jenis</option>
                    <option>Pengeluaran</option>
                    <option>Pemasukan</option>
                </select>
            </div>

            <!-- TABEL TRANSAKSI LENGKAP -->
            <div class="silver-card rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                                <th class="p-4">Tanggal (WIB)</th>
                                <th class="p-4">Kategori</th>
                                <th class="p-4">Catatan & Rincian Struk</th>
                                <th class="p-4">Dompet</th>
                                <th class="p-4">Sumber</th>
                                <th class="p-4 text-right">Nominal</th>
                                <th class="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <!-- Struk Row with expandable multi-items -->
                            <tr class="hover:bg-slate-50">
                                <td class="p-4 text-slate-500 font-medium">12 Okt 2026, 19:30</td>
                                <td class="p-4 font-bold text-slate-900">👕 Belanja Bulanan</td>
                                <td class="p-4">
                                    <div class="font-bold text-slate-900">Superindo supermarket</div>
                                    <span class="text-[11px] text-brand-600 font-semibold cursor-pointer" onclick="toggleStrukDetails('struk_1')">
                                        📸 Foto Struk (5 item) &bull; Klik untuk rincian &darr;
                                    </span>
                                </td>
                                <td class="p-4"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">BCA</span></td>
                                <td class="p-4"><span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700">📸 Struk OCR</span></td>
                                <td class="p-4 text-right font-extrabold text-brand-600">-Rp325.000</td>
                                <td class="p-4 text-center text-slate-400"><button class="hover:text-red-600">Hapus</button></td>
                            </tr>
                            <!-- Expanded items container -->
                            <tr id="struk_1" class="hidden bg-slate-50/80">
                                <td colspan="7" class="p-4 pl-12">
                                    <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                                        <div class="font-bold text-slate-700 pb-1 border-b">Rincian Item Struk Belanja:</div>
                                        <div class="flex justify-between"><span>&bull; Beras Pandan Wangi 5kg (Belanja)</span><span class="font-bold">Rp85.000</span></div>
                                        <div class="flex justify-between"><span>&bull; Minyak Goreng 2L (Belanja)</span><span class="font-bold">Rp38.000</span></div>
                                        <div class="flex justify-between"><span>&bull; Buah Apel Fuji 1kg (Makanan)</span><span class="font-bold">Rp42.000</span></div>
                                        <div class="flex justify-between"><span>&bull; Daging Ayam Fillet (Makanan)</span><span class="font-bold">Rp65.000</span></div>
                                        <div class="flex justify-between"><span>&bull; Sabun & Shampoo (Belanja)</span><span class="font-bold">Rp95.000</span></div>
                                    </div>
                                </td>
                            </tr>

                            <tr class="hover:bg-slate-50">
                                <td class="p-4 text-slate-500 font-medium">13 Okt 2026, 13:45</td>
                                <td class="p-4 font-bold text-slate-900">🍜 Makanan & Minuman</td>
                                <td class="p-4 text-slate-700">Makan siang bakso solo + es teh</td>
                                <td class="p-4"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">BCA</span></td>
                                <td class="p-4"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Telegram</span></td>
                                <td class="p-4 text-right font-extrabold text-brand-600">-Rp45.000</td>
                                <td class="p-4 text-center text-slate-400"><button class="hover:text-red-600">Hapus</button></td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="p-4 text-slate-500 font-medium">13 Okt 2026, 09:15</td>
                                <td class="p-4 font-bold text-slate-900">🚗 Transportasi</td>
                                <td class="p-4 text-slate-700">Isi bensin Pertamax (Transkrip suara: "Beli bensin pertamax 150rb via gopay")</td>
                                <td class="p-4"><span class="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-bold">GoPay</span></td>
                                <td class="p-4"><span class="px-2 py-0.5 rounded bg-purple-50 text-purple-700">🎙️ Voice Note</span></td>
                                <td class="p-4 text-right font-extrabold text-brand-600">-Rp150.000</td>
                                <td class="p-4 text-center text-slate-400"><button class="hover:text-red-600">Hapus</button></td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="p-4 text-slate-500 font-medium">01 Okt 2026, 08:00</td>
                                <td class="p-4 font-bold text-emerald-700">💰 Gaji & Pemasukan</td>
                                <td class="p-4 text-slate-700">Gaji pokok bulanan Oktober</td>
                                <td class="p-4"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">BCA</span></td>
                                <td class="p-4"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Telegram</span></td>
                                <td class="p-4 text-right font-extrabold text-emerald-600">+Rp18.500.000</td>
                                <td class="p-4 text-center text-slate-400"><button class="hover:text-red-600">Hapus</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Menampilkan 1-4 dari 4 transaksi</span>
                    <div class="flex gap-1">
                        <button class="px-3 py-1 rounded bg-white border border-slate-200 font-bold text-slate-700">1</button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        function toggleStrukDetails(id) {
            const el = document.getElementById(id);
            el.classList.toggle('hidden');
        }
    </script>
"@

    return Get-HtmlTemplate "Laporan & Export" $content "laporan"
}

# ==============================================================================
# DASHBOARD: BUDGET (PROGRESS BAR, ALERT 80% & 100%)
# ==============================================================================
function Get-DashboardBudgetHtml {
    $sidebar = Get-DashboardSidebar "budget"

    $content = @"
    <div class="flex min-h-screen bg-slate-50">
        $sidebar

        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-900">Budget per Kategori</h1>
                    <p class="text-xs sm:text-sm text-slate-500">Alert otomatis dikirim ke Telegram saat mencapai 80% dan 100%</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Budget 1 -->
                <div class="silver-card p-6 rounded-2xl bg-white border border-slate-200">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2.5">
                            <span class="text-2xl">🍜</span>
                            <div>
                                <h4 class="font-bold text-sm text-slate-900">Makanan & Minuman</h4>
                                <span class="text-xs text-slate-500">Terpakai: Rp2.150.000 / Rp3.000.000</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">71%</span>
                    </div>
                    <!-- Progress bar -->
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
                        <div class="bg-brand-500 h-3 rounded-full" style="width: 71%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-slate-500">
                        <span>Sisa: Rp850.000</span>
                        <span class="text-emerald-600 font-semibold">Terkontrol</span>
                    </div>
                </div>

                <!-- Budget 2 -->
                <div class="silver-card p-6 rounded-2xl bg-white border border-slate-200">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2.5">
                            <span class="text-2xl">🏠</span>
                            <div>
                                <h4 class="font-bold text-sm text-slate-900">Tagihan & Utilitas</h4>
                                <span class="text-xs text-slate-500">Terpakai: Rp2.400.000 / Rp2.500.000</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">96%</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
                        <div class="bg-red-500 h-3 rounded-full" style="width: 96%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-slate-500">
                        <span>Sisa: Rp100.000</span>
                        <span class="text-red-600 font-bold">⚠️ Alert 80% Terkirim ke Telegram</span>
                    </div>
                </div>

                <!-- Budget 3 -->
                <div class="silver-card p-6 rounded-2xl bg-white border border-slate-200">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2.5">
                            <span class="text-2xl">🚗</span>
                            <div>
                                <h4 class="font-bold text-sm text-slate-900">Transportasi</h4>
                                <span class="text-xs text-slate-500">Terpakai: Rp950.000 / Rp1.200.000</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">79%</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
                        <div class="bg-blue-500 h-3 rounded-full" style="width: 79%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-slate-500">
                        <span>Sisa: Rp250.000</span>
                        <span class="text-slate-500 font-medium">Mendekati Batas 80%</span>
                    </div>
                </div>

                <!-- Budget 4 -->
                <div class="silver-card p-6 rounded-2xl bg-white border border-slate-200">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2.5">
                            <span class="text-2xl">👕</span>
                            <div>
                                <h4 class="font-bold text-sm text-slate-900">Belanja Bulanan</h4>
                                <span class="text-xs text-slate-500">Terpakai: Rp1.650.000 / Rp2.000.000</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">82%</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
                        <div class="bg-brand-500 h-3 rounded-full" style="width: 82%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-slate-500">
                        <span>Sisa: Rp350.000</span>
                        <span class="text-amber-600 font-bold">⚠️ Alert 80% Terkirim</span>
                    </div>
                </div>
            </div>
        </main>
    </div>
"@

    return Get-HtmlTemplate "Kelola Budget" $content "budget"
}

# ==============================================================================
# DASHBOARD: WALLET (MULTI-WALLET & DEFAULT BOT WALLET)
# ==============================================================================
function Get-DashboardWalletHtml {
    $sidebar = Get-DashboardSidebar "wallet"

    $content = @"
    <div class="flex min-h-screen bg-slate-50">
        $sidebar

        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-900">Multi Wallet & Rekening</h1>
                    <p class="text-xs sm:text-sm text-slate-500">Pilih 1 dompet default untuk transaksi otomatis dari Telegram</p>
                </div>
                <button onclick="alert('Form tambah wallet baru terbuka!')" class="orange-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                    <i data-lucide="plus" class="w-4 h-4"></i> Tambah Wallet
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Wallet 1 (Default) -->
                <div class="silver-card p-6 rounded-2xl bg-white border-2 border-brand-500 relative shadow-md">
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-600 border border-brand-200">
                            ★ DEFAULT BOT TELEGRAM
                        </span>
                        <span class="text-xs font-bold text-blue-700">BCA</span>
                    </div>
                    <p class="text-xs text-slate-500">Rekening Utama</p>
                    <h3 class="text-2xl font-extrabold text-slate-900 mt-1">Rp14.500.000</h3>
                    <p class="text-[11px] text-slate-400 mt-3">Nomor: &bull;&bull;&bull;&bull; 8192</p>
                </div>

                <!-- Wallet 2 -->
                <div class="silver-card p-6 rounded-2xl bg-white border border-slate-200">
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            BANK
                        </span>
                        <span class="text-xs font-bold text-blue-900">Mandiri</span>
                    </div>
                    <p class="text-xs text-slate-500">Tabungan</p>
                    <h3 class="text-2xl font-extrabold text-slate-900 mt-1">Rp5.250.000</h3>
                    <div class="mt-3">
                        <button onclick="alert('Mandiri diatur sebagai default')" class="text-[11px] font-bold text-brand-600 hover:underline">Jadikan Default</button>
                    </div>
                </div>

                <!-- Wallet 3 -->
                <div class="silver-card p-6 rounded-2xl bg-white border border-slate-200">
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700">
                            E-WALLET
                        </span>
                        <span class="text-xs font-bold text-cyan-700">GoPay</span>
                    </div>
                    <p class="text-xs text-slate-500">Jajan & Transport</p>
                    <h3 class="text-2xl font-extrabold text-slate-900 mt-1">Rp485.000</h3>
                    <div class="mt-3">
                        <button onclick="alert('GoPay diatur sebagai default')" class="text-[11px] font-bold text-brand-600 hover:underline">Jadikan Default</button>
                    </div>
                </div>

                <!-- Wallet 4 -->
                <div class="silver-card p-6 rounded-2xl bg-white border border-slate-200">
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            CASH
                        </span>
                        <span class="text-xs font-bold text-emerald-700">Dompet Fisik</span>
                    </div>
                    <p class="text-xs text-slate-500">Uang Tunai</p>
                    <h3 class="text-2xl font-extrabold text-slate-900 mt-1">Rp350.000</h3>
                    <div class="mt-3">
                        <button onclick="alert('Cash diatur sebagai default')" class="text-[11px] font-bold text-brand-600 hover:underline">Jadikan Default</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
"@

    return Get-HtmlTemplate "Kelola Wallet" $content "wallet"
}

# ==============================================================================
# DASHBOARD: SETTINGS (PART 5 - TOKEN BOT, TEST KONEKSI, REMINDER, PROFIL)
# ==============================================================================
function Get-DashboardSettingsHtml {
    $sidebar = Get-DashboardSidebar "settings"

    $content = @"
    <div class="flex min-h-screen bg-slate-50">
        $sidebar

        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
            <div class="mb-8">
                <h1 class="text-2xl font-extrabold text-slate-900">Pengaturan Akun & Integrasi</h1>
                <p class="text-xs sm:text-sm text-slate-500">Kelola token Telegram Bot, reminder harian, dan profil</p>
            </div>

            <!-- TAB MENU -->
            <div class="flex gap-2 border-b border-slate-200 pb-3 mb-6 text-xs font-bold">
                <button class="px-4 py-2 rounded-xl bg-brand-500 text-white">Tab Telegram Bot</button>
                <button class="px-4 py-2 rounded-xl bg-white text-slate-600 border border-slate-200">Tab Profil</button>
                <button class="px-4 py-2 rounded-xl bg-white text-slate-600 border border-slate-200">Tab Reminder (Maks 2x/Hari)</button>
                <button class="px-4 py-2 rounded-xl bg-white text-slate-600 border border-slate-200">Tab Kategori Custom</button>
            </div>

            <div class="max-w-3xl space-y-8">
                <!-- PART 5: INTEGRASI TELEGRAM BOT & TEST KONEKSI -->
                <div class="silver-card p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-6">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h3 class="font-bold text-base text-slate-900">Pengaturan Token Bot Telegram</h3>
                            <p class="text-xs text-slate-500">Backend memanggil getMe & setWebhook secara otomatis</p>
                        </div>
                        <div id="connectionBadge" class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 🟢 Terhubung
                        </div>
                    </div>

                    <!-- PANDUAN STEP-BY-STEP DARI @BOTFATHER -->
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                        <div class="font-bold text-slate-900 flex items-center gap-1.5">
                            <i data-lucide="info" class="w-4 h-4 text-brand-500"></i> Panduan Step-by-Step dari @BotFather:
                        </div>
                        <ol class="list-decimal list-inside space-y-1 text-slate-600">
                            <li>Buka aplikasi Telegram dan cari bot resmi <strong>@BotFather</strong></li>
                            <li>Kirim perintah <code>/newbot</code> lalu beri nama dan username untuk bot Anda</li>
                            <li>Salin <strong>HTTP API Token</strong> yang diberikan oleh @BotFather</li>
                            <li>Paste token di kolom bawah dan klik tombol <strong>"Test Koneksi"</strong></li>
                        </ol>
                    </div>

                    <!-- TOKEN INPUT & TEST BUTTON -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">HTTP API Token Bot</label>
                            <input id="botTokenInput" type="text" value="7182948291:AAHkz81293_DemoTataDanaBotToken" class="w-full font-mono px-4 py-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500" />
                        </div>

                        <div class="flex flex-col sm:flex-row items-center gap-3">
                            <button onclick="handleTestConnection()" id="btnTest" class="orange-btn px-6 py-3 rounded-xl text-xs font-bold shadow flex items-center gap-2">
                                <i data-lucide="zap" class="w-4 h-4"></i> Test Koneksi & Aktifkan Webhook
                            </button>
                            <span id="testStatusText" class="text-xs font-medium text-slate-500"></span>
                        </div>
                    </div>

                    <!-- WEBHOOK STATUS DETAILS -->
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono text-slate-600">
                        <div><strong>Webhook Base URL:</strong> http://localhost:3000/api/telegram/webhook</div>
                        <div><strong>Idempotency Mode:</strong> Aktif (Cek update_id dobel di Supabase)</div>
                        <div><strong>Timezone Bot:</strong> Asia/Jakarta (WIB)</div>
                    </div>
                </div>

                <!-- TAB REMINDER (MAX 2X SEHARI) -->
                <div class="silver-card p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="font-bold text-sm text-slate-900">Reminder Harian Telegram</h3>
                            <p class="text-xs text-slate-500">Pengingat mencatat pengeluaran (Maksimal 2x per hari)</p>
                        </div>
                        <input type="checkbox" checked class="w-5 h-5 accent-brand-500 cursor-pointer" />
                    </div>

                    <div class="grid grid-cols-2 gap-4 text-xs pt-2">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Jam Reminder 1 (WIB)</label>
                            <input type="time" value="13:00" class="w-full px-3 py-2 rounded-xl border border-slate-200" />
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Jam Reminder 2 (WIB)</label>
                            <input type="time" value="20:30" class="w-full px-3 py-2 rounded-xl border border-slate-200" />
                        </div>
                    </div>

                    <div class="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border border-slate-200 whitespace-pre-line">
⏰ Reminder Keuangan!
Jangan lupa catat pengeluaran hari ini ya 📝
Pencatatan rutin = keuangan lebih terkontrol 💪
Ketik transaksimu sekarang!
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        async function handleTestConnection() {
            const token = document.getElementById('botTokenInput').value;
            const statusText = document.getElementById('testStatusText');
            const badge = document.getElementById('connectionBadge');

            badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> ⏳ Testing...';
            badge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200';
            statusText.innerText = 'Menghubungi Telegram API (getMe & setWebhook)...';

            try {
                const res = await fetch('/api/telegram/test-connection', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ token: token })
                });
                const data = await res.json();
                
                setTimeout(() => {
                    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500"></span> 🟢 Terhubung';
                    badge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
                    statusText.innerText = 'Token valid! Bot @' + data.result.username + ' siap menerima transaksi.';
                }, 800);
            } catch (err) {
                badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> 🔴 Tidak terhubung';
                badge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200';
                statusText.innerText = 'Gagal menghubungi Telegram API.';
            }
        }
    </script>
"@

    return Get-HtmlTemplate "Settings & Telegram Setup" $content "settings"
}

# ==============================================================================
# ADMIN DASHBOARD (PART 10 - SUPERADMIN, AI PROVIDERS, USERS, LOGS, MIDTRANS)
# ==============================================================================
function Get-AdminDashboardHtml {
    $content = @"
    <div class="min-h-screen bg-slate-900 text-white flex flex-col antialiased">
        <!-- Admin Header -->
        <header class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center font-bold text-white shadow">
                    <i data-lucide="shield" class="w-5 h-5"></i>
                </div>
                <div>
                    <h2 class="text-base font-extrabold text-white">TataDana Superadmin Console</h2>
                    <span class="text-xs text-brand-400">Multi-AI Failover &bull; User Impersonation &bull; Midtrans Approval</span>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <!-- User Impersonation Menu -->
                <a href="/dashboard" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white hover:bg-brand-600 transition flex items-center gap-1.5 shadow">
                    <i data-lucide="user-check" class="w-4 h-4"></i> Masuk Versi User (Impersonation)
                </a>
                <a href="/" class="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition">
                    Kembali ke Beranda
                </a>
            </div>
        </header>

        <main class="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
            <!-- 4 ADMIN STATS CARDS -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div class="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <span class="text-xs text-slate-400">Total Pengguna</span>
                    <p class="text-2xl font-extrabold text-white mt-1">1.428 User</p>
                    <span class="text-xs text-emerald-400">+48 user minggu ini</span>
                </div>
                <div class="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <span class="text-xs text-slate-400">Paket Pro Aktif</span>
                    <p class="text-2xl font-extrabold text-brand-400 mt-1">682 Pro</p>
                    <span class="text-xs text-slate-400">Konversi: 47.7%</span>
                </div>
                <div class="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <span class="text-xs text-slate-400">Panggilan AI Hari Ini</span>
                    <p class="text-2xl font-extrabold text-blue-400 mt-1">3.812 Panggilan</p>
                    <span class="text-xs text-slate-400">Avg Latency: 165ms</span>
                </div>
                <div class="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <span class="text-xs text-slate-400">Approval Pembayaran Manual</span>
                    <p class="text-2xl font-extrabold text-amber-400 mt-1">1 Menunggu</p>
                    <span class="text-xs text-amber-400">Butuh verifikasi bukti transfer</span>
                </div>
            </div>

            <!-- SECTION 1: KELOLA AI PROVIDER (GEMINI, GPT, DEEPSEEK) -->
            <div class="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-700">
                    <div>
                        <h3 class="font-bold text-base text-white">Konfigurasi AI Provider (Multi-Provider Failover)</h3>
                        <p class="text-xs text-slate-400">Mode paralel (failover otomatis) atau single provider</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-slate-400">Mode Eksekusi:</span>
                        <select class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-600 text-brand-400">
                            <option>Paralel (Failover Otomatis)</option>
                            <option>Single Provider</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <!-- Gemini -->
                    <div class="p-4 rounded-xl bg-slate-900 border border-brand-500/50 space-y-2">
                        <div class="flex items-center justify-between font-bold text-white">
                            <span>Google Gemini (Primary)</span>
                            <span class="text-emerald-400">● Aktif</span>
                        </div>
                        <p class="text-slate-400">Model: gemini-2.5-flash &bull; Total: 1.429 calls</p>
                        <div class="text-[11px] font-mono text-slate-500">API Key: enc_AIzaSyA8912xxxxxxxxxx</div>
                    </div>

                    <!-- OpenAI -->
                    <div class="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                        <div class="flex items-center justify-between font-bold text-white">
                            <span>OpenAI (GPT-4o Mini)</span>
                            <span class="text-amber-400">● Standby</span>
                        </div>
                        <p class="text-slate-400">Model: gpt-4o-mini &bull; Total: 85 calls</p>
                        <div class="text-[11px] font-mono text-slate-500">API Key: enc_sk-proj-81928xxxxxxxx</div>
                    </div>

                    <!-- DeepSeek -->
                    <div class="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                        <div class="flex items-center justify-between font-bold text-white">
                            <span>DeepSeek (V3 / R1)</span>
                            <span class="text-amber-400">● Standby</span>
                        </div>
                        <p class="text-slate-400">Model: deepseek-chat &bull; Total: 12 calls</p>
                        <div class="text-[11px] font-mono text-slate-500">API Key: enc_sk-ds-918201xxxxxxxxx</div>
                    </div>
                </div>
            </div>

            <!-- SECTION 2: APPROVE/REJECT PEMBAYARAN MANUAL MIDTRANS -->
            <div class="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-700">
                    <h3 class="font-bold text-base text-white">Approve / Reject Pembayaran Manual</h3>
                    <span class="text-xs text-amber-400">Midtrans & Manual Transfer Verification</span>
                </div>

                <div class="overflow-x-auto text-xs">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-slate-400 font-bold border-b border-slate-700">
                                <th class="pb-3">Order ID</th>
                                <th class="pb-3">User</th>
                                <th class="pb-3">Paket</th>
                                <th class="pb-3">Nominal</th>
                                <th class="pb-3">Metode</th>
                                <th class="pb-3">Status</th>
                                <th class="pb-3 text-right">Aksi Admin</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-700/60 font-medium">
                            <tr>
                                <td class="py-3 font-mono text-slate-300">ORD-TATA-PRO-918231</td>
                                <td class="py-3 text-white font-bold">Reza Pratama</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-brand-900/60 text-brand-300 font-bold">Pro Lifetime</span></td>
                                <td class="py-3 text-emerald-400 font-bold">Rp99.000</td>
                                <td class="py-3 text-slate-300">BCA Transfer Manual</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300">Pending Approval</span></td>
                                <td class="py-3 text-right space-x-2">
                                    <button onclick="alert('Pembayaran #ORD-TATA-PRO-918231 Disetujui! User otomatis di-upgrade ke Pro.')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold">Approve</button>
                                    <button onclick="alert('Pembayaran ditolak.')" class="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded">Reject</button>
                                </td>
                            </tr>
                            <tr>
                                <td class="py-3 font-mono text-slate-300">ORD-TATA-STR-817263</td>
                                <td class="py-3 text-white font-bold">Dewi Anggraini</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-slate-700 text-slate-300">Starter</span></td>
                                <td class="py-3 text-emerald-400 font-bold">Rp49.000</td>
                                <td class="py-3 text-slate-300">Midtrans GoPay</td>
                                <td class="py-3"><span class="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">Settlement (Auto)</span></td>
                                <td class="py-3 text-right text-slate-500">Auto Settled</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SECTION 3: AUDIT LOG TRANSAKSI USER (DENGAN AUDIT LOG PRIVASI) -->
            <div class="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-700">
                    <div>
                        <h3 class="font-bold text-base text-white">Log AI & Troubleshooting Support Transaksi</h3>
                        <p class="text-xs text-slate-400">Setiap akses data transaksi user otomatis dicatat di Audit Log demi privasi</p>
                    </div>
                    <button onclick="alert('Export data 1.428 user ke CSV/JSON diunduh!')" class="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white">
                        Export Data User
                    </button>
                </div>

                <div class="overflow-x-auto text-xs font-mono">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-slate-400 border-b border-slate-700">
                                <th class="pb-2">Waktu (WIB)</th>
                                <th class="pb-2">User</th>
                                <th class="pb-2">Input Chat Telegram</th>
                                <th class="pb-2">Provider Dipakai</th>
                                <th class="pb-2">Hasil Structured Output</th>
                                <th class="pb-2">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-700/60 text-slate-300">
                            <tr>
                                <td class="py-2.5">14:15:22 WIB</td>
                                <td>Budi Pratama</td>
                                <td class="text-amber-300">beli bakso 15rb</td>
                                <td>Gemini 2.5 Flash</td>
                                <td>{"nominal":15000,"kategori":"Makanan"}</td>
                                <td class="text-emerald-400 font-bold">Success (128ms)</td>
                            </tr>
                            <tr>
                                <td class="py-2.5">13:50:11 WIB</td>
                                <td>Siti Rahma</td>
                                <td class="text-amber-300">[Foto Struk] Indomaret 58rb</td>
                                <td>Gemini Vision OCR</td>
                                <td>{"items":4,"total":58000}</td>
                                <td class="text-emerald-400 font-bold">Success (412ms)</td>
                            </tr>
                            <tr>
                                <td class="py-2.5">12:05:40 WIB</td>
                                <td>Ahmad Fauzi</td>
                                <td class="text-amber-300">[Voice Note] gajian 8,5jt</td>
                                <td>Whisper + GPT-4o</td>
                                <td>{"jenis":"income","nominal":8500000}</td>
                                <td class="text-emerald-400 font-bold">Success (520ms)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
"@

    return Get-HtmlTemplate "Admin Dashboard" $content "admin"
}

# ==============================================================================
# TELEGRAM WEBHOOK HANDLER SIMULATOR (PART 4 SPECIFICATION)
# ==============================================================================
function Handle-TelegramWebhook($jsonBody) {
    try {
        $update = ConvertFrom-Json $jsonBody
        $text = $update.message.text
        if (-not $text) { $text = "" }

        # Check commands
        if ($text -eq "/saldo") {
            return '{"ok":true,"reply":"👛 Saldo TataDana:\n├ BCA: Rp14.500.000 (Default)\n├ Mandiri: Rp5.250.000\n├ GoPay: Rp485.000\n└ Cash: Rp350.000\n\nTotal Saldo: Rp20.585.000"}'
        } elseif ($text -eq "/budget") {
            return '{"ok":true,"reply":"📊 Status Budget Bulan Ini:\n├ 🍜 Makanan: [███████░░░] 71% (Sisa Rp850rb)\n├ 🏠 Tagihan: [█████████░] 96% (Sisa Rp100rb)\n├ 🚗 Transport: [███████░░░] 79% (Sisa Rp250rb)\n└ 👕 Belanja: [████████░░] 82% (Sisa Rp350rb)"}'
        }

        # Check natural language input (Part 4.1, 4.4, 4.5)
        $lower = $text.ToLower()
        $isIncome = $lower.Contains("gaji") -or $lower.Contains("masuk") -or $lower.Contains("cair")

        if ($isIncome) {
            # Format Reply Pemasukan (Part 4.5)
            $reply = "📅 Selasa, 13 Oktober 2026 — 14:35 WIB`n💰 Pemasukan tercatat!`n├ Nominal : Rp5.000.000`n├ Kategori : 💼 Pemasukan`n├ Dompet : 👛 BCA`n└ Saldo baru : Rp19.500.000`n`n💪 Semangat terus! Jangan lupa sisihkan untuk tabungan ya."
            return (@{ ok=$true; reply=$reply } | ConvertTo-Json)
        } else {
            # Format Reply Pengeluaran (Part 4.4)
            $reply = "📅 Selasa, 13 Oktober 2026 — 14:35 WIB`n💸 Pengeluaran tercatat!`n├ Nominal : Rp15.000`n├ Kategori : 🍜 Makanan & Minuman`n├ Dompet : 👛 BCA`n├ Catatan : " + $text + "`n└ Saldo : Rp14.485.000`n`n📊 Budget Makanan bulan ini:`n[███████░░░] 72% — sisa Rp835.000`nTetap hemat ya, masih ada 18 hari lagi!"
            return (@{ ok=$true; reply=$reply } | ConvertTo-Json)
        }
    } catch {
        return '{"ok":false,"error":"Format pesan tidak valid"}'
    }
}

function Get-CsvReportContent {
    return @"
LAPORAN KEUANGAN PRIBADI - TATADANA
Periode: Bulan Ini (Oktober 2026)
Waktu Export: 13/10/2026, 14.30.00 WIB

RINGKASAN ARUS KAS
Total Pemasukan,22700000,"Rp 22.700.000"
Total Pengeluaran,6370000,"Rp 6.370.000"
Net Cashflow (Selisih),16330000,"Rp 16.330.000"

DAFTAR TRANSAKSI LENGKAP
No,Tanggal,Waktu,Jenis,Kategori / Item,Nominal (IDR),Catatan,Sumber
1,2026-10-13,13:45,Pengeluaran,🍜 Makanan & Minuman,-45000,Makan siang bakso solo + es teh,Telegram Chat
2,2026-10-13,09:15,Pengeluaran,🚗 Transportasi,-150000,Isi bensin Pertamax,Voice Note (AI STT)
3,2026-10-12,19:30,Pengeluaran,👕 Belanja Bulanan,-325000,Superindo supermarket (5 item struk),Struk OCR
4,2026-10-10,14:00,Pengeluaran,🏠 Tagihan & Utilitas,-850000,Token listrik PLN & WiFi Indihome,Web App
5,2026-10-05,16:20,Pemasukan,💰 Gaji & Pemasukan,4200000,Proyek freelance UI/UX redesign,Web App
6,2026-10-01,08:00,Pemasukan,💰 Gaji & Pemasukan,18500000,Gaji pokok bulanan Oktober,Telegram Chat
"@
}

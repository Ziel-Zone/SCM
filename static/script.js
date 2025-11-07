    // Menunggu sampai semua elemen HTML dimuat sebelum menjalankan JS
    document.addEventListener('DOMContentLoaded', () => {

        // --- 1. Seleksi Elemen dari HTML ---
        
        // Header & Navigasi (Poin 3)
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const searchToggle = document.getElementById('searchToggle');
        const searchBarContainer = document.getElementById('searchBarContainer');
        const appContainer = document.querySelector('.app-container')

        // Modal (Poin 2)
        const modalOverlay = document.getElementById('inputModalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const transactionTypeInput = document.getElementById('transactionType');
        const btnCloseModal = document.getElementById('btnCloseModal');
        const btnCancelModal = document.getElementById('btnCancelModal');

        // Tombol Aksi Pembuka Modal (Poin 2)
        const btnModalMasukMobile = document.getElementById('btnModalMasukMobile');
        const btnModalKeluarMobile = document.getElementById('btnModalKeluarMobile');
        const btnShowModalMasuk = document.getElementById('btnShowModalMasuk'); // Desktop
        const btnShowModalKeluar = document.getElementById('btnShowModalKeluar'); // Desktop

        // Form
        const transactionForm = document.getElementById('transactionForm');

        
        // --- 2. Fungsi Logika ---

        /**
         * Membuka Modal dan Mengaturnya (Masuk/Keluar)
         * @param {string} type - 'masuk' atau 'keluar'
         * @param {string} title - Judul yang akan ditampilkan di modal
         */
        const openModal = (type, title) => {
            modalTitle.textContent = title;
            transactionTypeInput.value = type;
            modalOverlay.classList.add('show');
            // Reset form setiap kali dibuka (opsional tapi bagus)
            transactionForm.reset(); 
        };

        /**
         * Menutup Modal
         */
        const closeModal = () => {
            modalOverlay.classList.remove('show');
        };

        
        // --- 3. Event Listeners (Menghidupkan Tombol) ---

        // A. Header Listeners (Poin 3)
        
        // Meng-toggle (memunculkan/menyembunyikan) Search Bar
        searchToggle.addEventListener('click', () => {
            searchBarContainer.classList.toggle('show');
        });

        // Meng-toggle Sidebar (Lihat catatan CSS di bawah)
        // Meng-toggle Sidebar (Lihat catatan CSS di bawah)
        sidebarToggle.addEventListener('click', (event) => { // <-- 1. Tambahkan (event) di sini
            event.stopPropagation(); // <-- 2. Sekarang ini akan berfungsi
            sidebar.classList.toggle('show');
            appContainer.classList.toggle('sidebar-open');
        });

        appContainer.addEventListener('click', () => {
        // Cek dulu: Apakah sidebar-nya sedang terbuka?
        if (sidebar.classList.contains('show')) {
            // Jika iya, tutup sidebar-nya
            sidebar.classList.remove('show');
            // Dan hapus class 'sidebar-open' dari container
            appContainer.classList.remove('sidebar-open');
        }
        });

        // B. Modal Open Listeners (Poin 2)
        
        // Tombol Mobile
        btnModalMasukMobile.addEventListener('click', () => {
            openModal('masuk', 'Catat Barang Masuk');
        });
        btnModalKeluarMobile.addEventListener('click', () => {
            openModal('keluar', 'Catat Barang Keluar');
        });

        // Tombol Desktop
        btnShowModalMasuk.addEventListener('click', () => {
            openModal('masuk', 'Catat Barang Masuk');
        });
        btnShowModalKeluar.addEventListener('click', () => {
            openModal('keluar', 'Catat Barang Keluar');
        });

        // C. Modal Close Listeners
        btnCloseModal.addEventListener('click', closeModal);
        btnCancelModal.addEventListener('click', closeModal);

        // Menutup modal saat mengklik area overlay (luar kotak)
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });

        // D. Form Submission Listener
        transactionForm.addEventListener('submit', (event) => {
            // Mencegah halaman me-reload saat form disubmit
            event.preventDefault(); 
            
            // 1. Ambil data dari form
            const type = transactionTypeInput.value;
            const item = document.getElementById('searchItem').value;
            const amount = document.getElementById('itemAmount').value;
            const notes = document.getElementById('itemNotes').value;
            
            // 2. (Untuk Tes) Tampilkan data di console
            console.log('--- FORM SUBMITTED ---');
            console.log('Tipe:', type);
            console.log('Barang:', item);
            console.log('Jumlah:', amount);
            console.log('Keterangan:', notes);
            
            // 3. (Nantinya) Di sinilah Anda akan mengirim data ke backend (API)
            // fetch('/api/transaksi', { method: 'POST', body: ... });

            // 4. Tutup modal setelah berhasil submit
            closeModal();
        });

    });

// ===============================================
// === TAMBAHAN UNTUK MODAL PRODUK (DAFTAR BARANG) ===
// ===============================================

// Cek apakah kita berada di halaman Daftar Barang
// (Hanya jalankan jika elemen-elemen ini ada)
const btnShowProductModalMobile = document.getElementById('btnShowProductModalMobile');
const btnShowProductModalDesktop = document.getElementById('btnShowProductModalDesktop');

if (btnShowProductModalMobile) { // Cukup cek 1 tombol
    
    // 1. Seleksi Elemen Modal Produk
    const productModalOverlay = document.getElementById('productModalOverlay');
    const productModalTitle = document.getElementById('productModalTitle');
    const btnCloseProductModal = document.getElementById('btnCloseProductModal');
    const btnCancelProductModal = document.getElementById('btnCancelProductModal');
    const productForm = document.getElementById('productForm');

    // 2. Fungsi Buka/Tutup
    const openProductModal = (mode = 'add') => {
        if (mode === 'edit') {
            productModalTitle.textContent = 'Edit Barang';
            // (Nanti di sini kita isi form dengan data barang)
        } else {
            productModalTitle.textContent = 'Tambah Barang Baru';
            productForm.reset(); // Kosongkan form
        }
        productModalOverlay.classList.add('show');
    };

    const closeProductModal = () => {
        productModalOverlay.classList.remove('show');
    };

    // 3. Event Listeners
    btnShowProductModalMobile.addEventListener('click', () => openProductModal('add'));
    btnShowProductModalDesktop.addEventListener('click', () => openProductModal('add'));
    
    btnCloseProductModal.addEventListener('click', closeProductModal);
    btnCancelProductModal.addEventListener('click', closeProductModal);

    productModalOverlay.addEventListener('click', (event) => {
        if (event.target === productModalOverlay) {
            closeProductModal();
        }
    });

    // 4. Form Submit
    productForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Ambil data
        const namaBarang = document.getElementById('productName').value;
        const satuan = document.getElementById('productUnit').value;
        const kategori = document.getElementById('productCategory').value;
        const minStok = document.getElementById('productMinStock').value;
        
        console.log('--- FORM PRODUK BARU DISUBMIT ---');
        console.log('Nama:', namaBarang);
        console.log('Satuan:', satuan);
        console.log('Kategori:', kategori);
        console.log('Min. Stok:', minStok);

        // (Kirim data ke backend...)

        closeProductModal(); // Tutup modal
    });
    
    // (Nanti di sini tambahkan listener untuk tombol "..." di tiap kartu)
}
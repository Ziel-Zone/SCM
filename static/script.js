// Menunggu sampai semua elemen HTML dimuat sebelum menjalankan JS
document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // === 1. SELEKSI ELEMEN (GLOBAL) ===
    // ===============================================
    // Variabel ini akan 'null' jika elemennya tidak ada di halaman
    
    // --- Elemen Umum (Sidebar, dll) ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const searchToggle = document.getElementById('searchToggle');
    const searchBarContainer = document.getElementById('searchBarContainer');
    const appContainer = document.querySelector('.app-container');

    // --- Elemen Modal Transaksi (Halaman Dashboard) ---
    const modalOverlay = document.getElementById('inputModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const transactionTypeInput = document.getElementById('transactionType');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnModalMasukMobile = document.getElementById('btnModalMasukMobile');
    const btnModalKeluarMobile = document.getElementById('btnModalKeluarMobile');
    const btnShowModalMasuk = document.getElementById('btnShowModalMasuk'); // Desktop
    const btnShowModalKeluar = document.getElementById('btnShowModalKeluar'); // Desktop
    const transactionForm = document.getElementById('transactionForm');

    // --- Elemen Modal Produk (Halaman Daftar Barang) ---
    const btnShowProductModalMobile = document.getElementById('btnShowProductModalMobile');
    // (Tombol desktop-nya, jika ada)
    // const btnShowProductModalDesktop = document.getElementById('btnShowProductModalDesktop'); 
    const productModalOverlay = document.getElementById('productModalOverlay');
    const productModalTitle = document.getElementById('productModalTitle');
    const btnCloseProductModal = document.getElementById('btnCloseProductModal');
    const btnCancelProductModal = document.getElementById('btnCancelProductModal');
    const productForm = document.getElementById('productForm');


    // ===============================================
    // === 2. FUNGSI LOGIKA (Bisa Dipakai Bersama) ===
    // ===============================================
    
    // (Fungsi-fungsi ini aman karena hanya dipanggil oleh event listener)

    const openModal = (type, title) => {
        modalTitle.textContent = title;
        transactionTypeInput.value = type;
        modalOverlay.classList.add('show');
        transactionForm.reset(); 
    };

    const closeModal = () => {
        modalOverlay.classList.remove('show');
    };
    
    const openProductModal = (mode = 'add') => {
        if (mode === 'edit') {
            productModalTitle.textContent = 'Edit Barang';
        } else {
            productModalTitle.textContent = 'Tambah Barang Baru';
            productForm.reset();
        }
        productModalOverlay.classList.add('show');
    };

    const closeProductModal = () => {
        productModalOverlay.classList.remove('show');
    };

    
    // ===============================================
    // === 3. EVENT LISTENERS (BAGIAN AMAN) ===
    // ===============================================
    // Kita cek 'if (elemen)' SEBELUM memasang listener.
    // Ini adalah kunci agar tidak error di halaman yang berbeda.

    // --- A. Listener Navigasi Umum ---
    
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchBarContainer.classList.toggle('show');
        });
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Mencegah "klik di luar"
            sidebar.classList.toggle('show');
            appContainer.classList.toggle('sidebar-open');
        });
    }

    if (appContainer) {
        appContainer.addEventListener('click', () => {
            if (sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                appContainer.classList.remove('sidebar-open');
            }
        });
    }

    // --- B. Listener Modal Transaksi (Hanya jalan di Dashboard) ---
    
    if (btnModalMasukMobile) {
        btnModalMasukMobile.addEventListener('click', () => {
            openModal('masuk', 'Catat Barang Masuk');
        });
    }
    if (btnModalKeluarMobile) {
        btnModalKeluarMobile.addEventListener('click', () => {
            openModal('keluar', 'Catat Barang Keluar');
        });
    }
    if (btnShowModalMasuk) {
        btnShowModalMasuk.addEventListener('click', () => {
            openModal('masuk', 'Catat Barang Masuk');
        });
    }
    if (btnShowModalKeluar) {
        btnShowModalKeluar.addEventListener('click', () => {
            openModal('keluar', 'Catat Barang Keluar');
        });
    }
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }
    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }
    if (transactionForm) {
        transactionForm.addEventListener('submit', (event) => {
            event.preventDefault(); 
            // ... (logika submit Anda)
            console.log('Form Transaksi disubmit');
            closeModal();
        });
    }

    // --- C. Listener Modal Produk (Hanya jalan di Daftar Barang) ---

    if (btnShowProductModalMobile) {
        btnShowProductModalMobile.addEventListener('click', () => openProductModal('add'));
    }
    // if (btnShowProductModalDesktop) {
    //     btnShowProductModalDesktop.addEventListener('click', () => openProductModal('add'));
    // }
    if (btnCloseProductModal) {
        btnCloseProductModal.addEventListener('click', closeProductModal);
    }
    if (btnCancelProductModal) {
        btnCancelProductModal.addEventListener('click', closeProductModal);
    }
    if (productModalOverlay) {
        productModalOverlay.addEventListener('click', (event) => {
            if (event.target === productModalOverlay) {
                closeProductModal();
            }
        });
    }
    if (productForm) {
        productForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // ... (logika submit produk Anda)
            console.log('Form Produk disubmit');
            closeProductModal();
        });
    }

}); // <-- AKHIR DARI DOMContentLoaded
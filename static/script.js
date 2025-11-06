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
    sidebarToggle.addEventListener('click', () => {
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
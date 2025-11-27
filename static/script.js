// Menunggu sampai semua elemen HTML dimuat sebelum menjalankan JS
document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // === 1. SELEKSI ELEMEN (GLOBAL) ===
    // ===============================================

    // --- Elemen Umum (Sidebar, Navigasi) ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const searchToggle = document.getElementById('searchToggle');
    const searchBarContainer = document.getElementById('searchBarContainer');
    const appContainer = document.querySelector('.app-container');

    // --- Elemen Modal Transaksi (Dashboard) ---
    const modalOverlay = document.getElementById('inputModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const transactionTypeInput = document.getElementById('transactionType');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnModalMasukMobile = document.getElementById('btnModalMasukMobile');
    const btnModalKeluarMobile = document.getElementById('btnModalKeluarMobile');
    const btnShowModalMasuk = document.getElementById('btnShowModalMasuk');
    const btnShowModalKeluar = document.getElementById('btnShowModalKeluar');
    const transactionForm = document.getElementById('transactionForm');

    // Elemen Search di dalam Modal Transaksi
    const searchInput = document.getElementById('searchItemInput');
    const hiddenIdInput = document.getElementById('itemSelect');
    const resultsList = document.getElementById('searchResults');
    const unitLabel = document.getElementById('itemUnit');

    // --- Elemen Modal Produk (Daftar Barang) ---
    const btnShowProductModalMobile = document.getElementById('btnShowProductModalMobile');
    const btnShowProductModalDesktop = document.getElementById('btnShowProductModalDesktop');
    const productModalOverlay = document.getElementById('productModalOverlay');
    const productModalTitle = document.getElementById('productModalTitle');
    const btnCloseProductModal = document.getElementById('btnCloseProductModal');
    const btnCancelProductModal = document.getElementById('btnCancelProductModal');
    const productForm = document.getElementById('productForm');
    
    // Input Form Produk
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productUnitInput = document.getElementById('productUnit');
    const productCategoryInput = document.getElementById('productCategory');
    const productMinStockInput = document.getElementById('productMinStock');

    // --- Elemen Global Search (Navbar) ---
    const globalSearchInput = document.getElementById('globalSearchInput');
    const globalResultsList = document.getElementById('globalSearchResults');


    // ===============================================
    // === 2. FUNGSI LOGIKA ===
    // ===============================================

    // --- Logika Modal Transaksi ---
    const openModal = (type, title) => {
        if (modalTitle) modalTitle.textContent = title;
        if (transactionTypeInput) transactionTypeInput.value = type;
        if (modalOverlay) modalOverlay.classList.add('show');
        if (transactionForm) transactionForm.reset();
        // Reset tampilan search
        if (unitLabel) unitLabel.textContent = '-';
        if (resultsList) resultsList.style.display = 'none';
    };

    const closeModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('show');
    };

    // --- Logika Modal Produk ---
    const openProductModal = (mode, data = null) => {
        if (mode === 'edit' && data) {
            productModalTitle.textContent = 'Edit Barang';
            productIdInput.value = data.id;
            productNameInput.value = data.nama;
            productUnitInput.value = data.satuan;
            productCategoryInput.value = data.kategori;
            productMinStockInput.value = data.min;
        } else {
            productModalTitle.textContent = 'Tambah Barang Baru';
            if (productForm) productForm.reset();
            if (productIdInput) productIdInput.value = '';
        }
        if (productModalOverlay) productModalOverlay.classList.add('show');
    };

    const closeProductModal = () => {
        if (productModalOverlay) productModalOverlay.classList.remove('show');
    };


    // ===============================================
    // === 3. EVENT LISTENERS ===
    // ===============================================

    // --- A. Navigasi & Sidebar ---
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchBarContainer.classList.toggle('show');
        });
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            sidebar.classList.toggle('show');
            appContainer.classList.toggle('sidebar-open');
        });
    }

    if (appContainer) {
        appContainer.addEventListener('click', () => {
            if (sidebar && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                appContainer.classList.remove('sidebar-open');
            }
        });
    }

    // --- B. Modal Transaksi (Dashboard) ---
    if (btnModalMasukMobile) btnModalMasukMobile.addEventListener('click', () => openModal('masuk', 'Catat Barang Masuk'));
    if (btnModalKeluarMobile) btnModalKeluarMobile.addEventListener('click', () => openModal('keluar', 'Catat Barang Keluar'));
    if (btnShowModalMasuk) btnShowModalMasuk.addEventListener('click', () => openModal('masuk', 'Catat Barang Masuk'));
    if (btnShowModalKeluar) btnShowModalKeluar.addEventListener('click', () => openModal('keluar', 'Catat Barang Keluar'));
    
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) closeModal();
        });
    }

    // --- C. Live Search di Modal Transaksi ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            resultsList.innerHTML = '';
            
            if (keyword.length < 1) {
                resultsList.style.display = 'none';
                return;
            }

            if (typeof DATA_BARANG !== 'undefined') {
                const filtered = DATA_BARANG.filter(item => item.nama.toLowerCase().includes(keyword));

                if (filtered.length > 0) {
                    resultsList.style.display = 'block';
                    filtered.forEach(item => {
                        const div = document.createElement('div');
                        div.classList.add('search-result-item');
                        div.innerHTML = `
                            <div><strong>${item.nama}</strong><small>Stok: ${item.stok}</small></div>
                            <small>${item.satuan}</small>
                        `;
                        div.addEventListener('click', () => {
                            searchInput.value = item.nama;
                            hiddenIdInput.value = item.id;
                            unitLabel.textContent = item.satuan;
                            resultsList.style.display = 'none';
                        });
                        resultsList.appendChild(div);
                    });
                } else {
                    resultsList.style.display = 'block';
                    resultsList.innerHTML = '<div style="padding:12px; color:#888;">Barang tidak ditemukan</div>';
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
                resultsList.style.display = 'none';
            }
        });
    }

    // --- D. Submit Form Transaksi ---
    if (transactionForm) {
        transactionForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            
            const formData = {
                product_id: hiddenIdInput.value, // Pakai hidden input dari search
                jumlah: document.getElementById('itemAmount').value,
                keterangan: document.getElementById('itemNotes').value,
                tipe: transactionTypeInput.value 
            };

            if (!formData.product_id) {
                alert("Silakan pilih barang dari daftar pencarian!");
                return;
            }

            try {
                const response = await fetch('/transaksi/baru', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    closeModal();
                    location.reload();
                } else {
                    alert('Gagal: ' + (result.error || result.message));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }

    // --- E. Modal Produk (Daftar Barang) ---
    if (btnShowProductModalMobile) btnShowProductModalMobile.addEventListener('click', () => openProductModal('add'));
    if (btnShowProductModalDesktop) btnShowProductModalDesktop.addEventListener('click', () => openProductModal('add'));
    
    if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeProductModal);
    if (btnCancelProductModal) btnCancelProductModal.addEventListener('click', closeProductModal);
    
    if (productModalOverlay) {
        productModalOverlay.addEventListener('click', (event) => {
            if (event.target === productModalOverlay) closeProductModal();
        });
    }

    // --- F. Tombol Edit & Hapus (Delegasi Event) ---
    const itemListContainer = document.querySelector('.item-list-container');
    if (itemListContainer) {
        itemListContainer.addEventListener('click', async (e) => {
            // Edit
            if (e.target.closest('.edit-btn')) {
                const btn = e.target.closest('.edit-btn');
                const data = {
                    id: btn.dataset.id,
                    nama: btn.dataset.nama,
                    satuan: btn.dataset.satuan,
                    kategori: btn.dataset.kategori,
                    min: btn.dataset.min
                };
                openProductModal('edit', data);
            }
            // Hapus
            if (e.target.closest('.delete-btn')) {
                const btn = e.target.closest('.delete-btn');
                const id = btn.dataset.id;
                const nama = btn.dataset.nama;
                
                if (confirm(`Yakin ingin menghapus "${nama}"?`)) {
                    try {
                        const response = await fetch(`/produk/hapus/${id}`, { method: 'DELETE' });
                        const result = await response.json();
                        if (response.ok) {
                            alert(result.message);
                            location.reload();
                        } else {
                            alert("Gagal: " + result.error);
                        }
                    } catch (error) {
                        alert("Error koneksi ke server.");
                    }
                }
            }
        });
    }

    // --- G. Submit Form Produk ---
    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const id = productIdInput.value;
            const formData = {
                nama_barang: productNameInput.value,
                satuan: productUnitInput.value,
                kategori: productCategoryInput.value,
                stock_minimum: productMinStockInput.value
            };

            let url = id ? `/produk/edit/${id}` : '/produk/baru';
            let method = id ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    closeProductModal();
                    location.reload();
                } else {
                    alert('Gagal: ' + (result.error || result.message));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }

    // --- H. Global Search (Navbar) ---
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            globalResultsList.innerHTML = '';
            if (keyword.length < 1) {
                globalResultsList.style.display = 'none';
                return;
            }
            if (typeof GLOBAL_DATA_BARANG !== 'undefined') {
                const filtered = GLOBAL_DATA_BARANG.filter(item => item.nama.toLowerCase().includes(keyword));
                if (filtered.length > 0) {
                    globalResultsList.style.display = 'block';
                    filtered.forEach(item => {
                        const div = document.createElement('div');
                        div.classList.add('search-result-item');
                        div.innerHTML = `<div><strong>${item.nama}</strong><small>Stok: ${item.stok}</small></div>`;
                        div.addEventListener('click', () => {
                            alert(`Detail: ${item.nama}\n(Stok: ${item.stok})`);
                            globalResultsList.style.display = 'none';
                        });
                        globalResultsList.appendChild(div);
                    });
                } else {
                    globalResultsList.style.display = 'block';
                    globalResultsList.innerHTML = '<div style="padding:12px; color:#888;">Tidak ditemukan</div>';
                }
            }
        });
        document.addEventListener('click', (e) => {
            if (!globalSearchInput.contains(e.target) && !globalResultsList.contains(e.target)) {
                globalResultsList.style.display = 'none';
            }
        });
    }

});
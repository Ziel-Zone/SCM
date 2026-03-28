// Menunggu sampai semua elemen HTML dimuat sebelum menjalankan JS
document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // === 1. SELEKSI ELEMEN (GLOBAL) ===
    // ===============================================

    // --- Elemen Umum (Navbar Baru) ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const searchToggle = document.getElementById('searchToggle');
    const searchBarContainer = document.getElementById('searchBarContainer');

    // --- Elemen Modal Transaksi (Dashboard) ---
    const modalOverlay = document.getElementById('inputModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const transactionTypeInput = document.getElementById('transactionType');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');

    // Tombol pemicu Modal Transaksi
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
    const productIdInput = document.getElementById('productId'); // Ini yang sering bikin error
    const productNameInput = document.getElementById('productName');
    const productUnitInput = document.getElementById('productUnit');
    const productCategoryInput = document.getElementById('productCategory');
    const productMinStockInput = document.getElementById('productMinStock');

    // --- Elemen Global Search (Navbar) ---
    const globalSearchInput = document.getElementById('globalSearchInput');
    const globalResultsList = document.getElementById('globalSearchResults');


    // ===============================================
    // === 2. FUNGSI LOGIKA (DILINDUNGI NULL CHECKER) ===
    // ===============================================

    const openModal = (type, title) => {
        if (modalTitle) modalTitle.textContent = title;
        if (transactionTypeInput) transactionTypeInput.value = type;
        if (transactionForm) transactionForm.reset();
        if (unitLabel) unitLabel.textContent = '-';
        if (resultsList) resultsList.style.display = 'none';
        if (modalOverlay) modalOverlay.classList.add('show');
    };

    const closeModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('show');
    };

    const openProductModal = (mode, data = null) => {
        if (mode === 'edit' && data) {
            if (productModalTitle) productModalTitle.textContent = 'Edit Barang';
            if (productIdInput) productIdInput.value = data.id;
            if (productNameInput) productNameInput.value = data.nama;
            if (productUnitInput) productUnitInput.value = data.satuan;
            if (productCategoryInput) productCategoryInput.value = data.kategori;
            if (productMinStockInput) productMinStockInput.value = data.min;
        } else {
            if (productModalTitle) productModalTitle.textContent = 'Tambah Barang Baru';
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

    // --- A. Navigasi Atas (Navbar) ---
    if (searchToggle && searchBarContainer) {
        searchToggle.addEventListener('click', () => {
            searchBarContainer.classList.toggle('show');
            if (searchBarContainer.classList.contains('show')) globalSearchInput.focus();
        });
    }

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // --- B. Pemicu Modal Transaksi ---
    if (btnModalMasukMobile) btnModalMasukMobile.addEventListener('click', () => openModal('masuk', 'Catat Barang Masuk'));
    if (btnModalKeluarMobile) btnModalKeluarMobile.addEventListener('click', () => openModal('keluar', 'Catat Barang Keluar'));
    if (btnShowModalMasuk) btnShowModalMasuk.addEventListener('click', () => openModal('masuk', 'Catat Barang Masuk'));
    if (btnShowModalKeluar) btnShowModalKeluar.addEventListener('click', () => openModal('keluar', 'Catat Barang Keluar'));

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // --- C. Live Search di Modal Transaksi ---
    if (searchInput && resultsList && hiddenIdInput) {
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
                            if (unitLabel) unitLabel.textContent = item.satuan;
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

        // Sembunyikan hasil pencarian jika klik di luar
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

            // Cek apakah user sudah pilih barang dari list
            if (!hiddenIdInput.value) {
                alert("Silakan pilih barang dari daftar pencarian terlebih dahulu!");
                return;
            }

            // Ganti text tombol saat loading
            const btnSubmit = transactionForm.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerText;
            btnSubmit.innerText = "Menyimpan...";
            btnSubmit.disabled = true;

            const formData = {
                product_id: hiddenIdInput.value,
                jumlah: document.getElementById('itemAmount').value,
                keterangan: document.getElementById('itemNotes').value,
                tipe: transactionTypeInput.value
            };

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
            } finally {
                // Kembalikan tombol ke semula jika gagal refresh
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
            }
        });
    }

    // --- E. Pemicu Modal Produk ---
    if (btnShowProductModalMobile) btnShowProductModalMobile.addEventListener('click', () => openProductModal('add'));
    if (btnShowProductModalDesktop) btnShowProductModalDesktop.addEventListener('click', () => openProductModal('add'));
    if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeProductModal);
    if (btnCancelProductModal) btnCancelProductModal.addEventListener('click', closeProductModal);

    // --- F. Tombol Edit & Hapus (Daftar Barang) ---
    const itemListContainer = document.querySelector('.item-list-container');
    if (itemListContainer) {
        itemListContainer.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');

            if (editBtn) {
                const data = {
                    id: editBtn.dataset.id,
                    nama: editBtn.dataset.nama,
                    satuan: editBtn.dataset.satuan,
                    kategori: editBtn.dataset.kategori,
                    min: editBtn.dataset.min
                };
                openProductModal('edit', data);
            }

            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                const nama = deleteBtn.dataset.nama;

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

            // AMAN: Jika productIdInput tidak ada, id akan dikosongkan tanpa error
            const id = productIdInput ? productIdInput.value : '';

            // Ganti text tombol saat loading
            const btnSubmit = productForm.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerText;
            btnSubmit.innerText = "Menyimpan...";
            btnSubmit.disabled = true;

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
            } finally {
                // Kembalikan tombol ke semula jika gagal refresh
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
            }
        });
    }

    // --- H. Global Search (Navbar) ---
    if (globalSearchInput && globalResultsList) {
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
                        div.innerHTML = `<div><strong>${item.nama}</strong><small>Stok: ${item.stok} ${item.satuan}</small></div>`;
                        div.addEventListener('click', () => {
                            alert(`Detail:\nNama: ${item.nama}\nStok: ${item.stok} ${item.satuan}`);
                            globalResultsList.style.display = 'none';
                            globalSearchInput.value = '';
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
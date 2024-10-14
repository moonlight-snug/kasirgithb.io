document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("product-form");
  const salesForm = document.getElementById("sales-form");
  const productSelect = document.getElementById("product-select");
  const productTable = document
    .getElementById("product-table")
    .getElementsByTagName("tbody")[0];

  let totalQty = 0;
  let subtotal = 0;

  // Menangani form untuk menambahkan barang
  productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const productName = document.getElementById("product-name").value;
    const productPrice = parseInt(
      document.getElementById("product-price").value
    );

    // Tambahkan opsi baru ke dropdown produk
    const option = document.createElement("option");
    option.value = productName;
    option.textContent = `${productName} - Rp ${productPrice}`;
    option.setAttribute("data-price", productPrice);
    productSelect.appendChild(option);

    // Bersihkan input form
    productForm.reset();
  });

  // Menangani form untuk menambahkan barang ke struk
  salesForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const selectedProductName = productSelect.value;
    const productQty = parseInt(document.getElementById("product-qty").value);

    if (selectedProductName && productQty) {
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      const productPrice = parseInt(selectedOption.getAttribute("data-price"));

      // Cek apakah produk sudah ada di tabel
      const existingRow = Array.from(productTable.rows).find(
        (row) => row.cells[0].innerText === selectedProductName
      );

      if (existingRow) {
        // Jika produk sudah ada, tambahkan jumlahnya
        const existingQty = parseInt(existingRow.cells[1].innerText);
        const newQty = existingQty + productQty;
        existingRow.cells[1].innerText = newQty;

        // Update subtotal
        subtotal += productQty * productPrice;
      } else {
        // Tambahkan produk ke tabel struk
        const row = productTable.insertRow();
        row.insertCell(0).innerText = selectedProductName;
        row.insertCell(1).innerText = productQty;
        row.insertCell(2).innerText = `Rp ${productPrice.toLocaleString()}`;

        // Update subtotal
        subtotal += productQty * productPrice;
      }

      // Update total qty
      totalQty += productQty;
      document.getElementById("total-qty").innerText = totalQty;
      document.getElementById("subtotal").innerText = subtotal.toLocaleString();

      // Tampilkan invoice box
      document.querySelector(".invoice-box").style.display = "block";
    }

    // Bersihkan input form
    salesForm.reset();
  });

  // Menangani input uang konsumen
  document
    .getElementById("consumer-money")
    .addEventListener("input", function () {
      const consumerMoney = parseInt(this.value) || 0;
      const change = consumerMoney - subtotal;

      document.getElementById("change").innerText =
        change >= 0 ? change.toLocaleString() : 0;
    });

  // Fungsi untuk mencetak struk
  async function printStruk() {
    const invoiceBox = document.querySelector(".invoice-box");
    const date = document.getElementById("date").innerText;
    const productRows = Array.from(productTable.rows);

    // Membuat string untuk struk
    let printContent = `Struk Penjualan\nTanggal: ${date}\n`;
    printContent += `------------------------------------\n`;
    productRows.forEach((row) => {
      const name = row.cells[0].innerText;
      const qty = row.cells[1].innerText;
      const price = row.cells[2].innerText;
      printContent += `${name} - ${qty} - ${price}\n`;
    });
    printContent += `------------------------------------\n`;
    printContent += `Total Jumlah: ${totalQty}\n`;
    printContent += `Subtotal: Rp ${subtotal.toLocaleString()}\n`;
    const consumerMoney = document.getElementById("consumer-money").value || 0;
    printContent += `Uang Konsumen: Rp ${consumerMoney}\n`;
    printContent += `Kembalian: Rp ${
      document.getElementById("change").innerText
    }\n`;
    printContent += `------------------------------------\n`;
    printContent += `Terima Kasih!`;

    // Mencetak dengan printer Bluetooth
    try {
      const printer = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["printer"] }], // Ubah sesuai dengan layanan printer Bluetooth Anda
      });

      const server = await printer.gatt.connect();
      const service = await server.getPrimaryService("printer");
      const characteristic = await service.getCharacteristic(
        "printer_characteristic"
      ); // Ubah sesuai dengan karakteristik yang sesuai

      await characteristic.writeValue(new TextEncoder().encode(printContent));
      console.log("Struk berhasil dikirim ke printer Bluetooth.");

      // Pemberitahuan berhasil
      alert("Struk berhasil dicetak ke printer Bluetooth.");

      // Reset struk hanya jika print berhasil
      resetStruk();
    } catch (error) {
      console.error("Error connecting to Bluetooth device: ", error);
      alert("Gagal menghubungkan ke perangkat Bluetooth. Silakan coba lagi.");
      // Jangan reset struk di sini
    }
  }

  // Menangani tombol print
  const printButton = document.getElementById("print-button");
  printButton.addEventListener("click", printStruk);

  // Reset struk
  function resetStruk() {
    productTable.innerHTML = ""; // Kosongkan tabel struk
    totalQty = 0;
    subtotal = 0;
    document.getElementById("total-qty").innerText = totalQty;
    document.getElementById("subtotal").innerText = subtotal.toLocaleString();
    document.getElementById("consumer-money").value = ""; // Kosongkan input uang konsumen
    document.getElementById("change").innerText = "0"; // Reset kembalian
    document.querySelector(".invoice-box").style.display = "none"; // Sembunyikan struk
  }

  // Set tanggal saat ini
  const dateElement = document.getElementById("date");
  const currentDate = new Date();
  dateElement.innerText = currentDate.toLocaleString();
});

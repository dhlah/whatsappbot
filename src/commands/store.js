

async function handleStoreCommand(sock, messages, noWa) {
  const replyMenu =
    "*Coding Store* \n \nKonter Di SMK Texar Klari Karawang \n\nMelayani \n\n■ Pembelian Pulsa \n■ Pembelian Kuota \n■ Top Up Uang Digital (Dana, OVO, Gopay, ShopeePay, I Saku,) \n■ Top Up Game \n■ Transfer Antar Bank \n■ Tarik Tunai Dana, OVO, Gopay \n■ Token Listrik \n■ Bayar PGN \n■ Bayar PDAM \n\n\n*Hanya Bisa Menerima Hutang H-1, Jika Melebihi Akan Dihitung Blacklist atau Tidak Bisa Transaksi Di Coding Store*";
  const listProduk = [
    {
      title: "Kuota",
      rows: [
        {
          title: "Axis",
          rowId: "kuota-axis",
        },
        {
          title: "Three",
          rowId: "kuota-three",
        },
        {
          title: "Telkomsel",
          rowId: "kuota-telkom",
        },
        {
          title: "Indosat",
          rowId: "kuota-indosat",
        },
        {
          title: "Smartfren",
          rowId: "kuota-smartfren",
        },
        {
          title: "By U",
          rowId: "kuota-byu",
        },
        {
          title: "XL",
          rowId: "kuota-xl",
        },
      ],
    },
    {
      title: "Top Up E-Money",
      rows: [
        {
          title: "Dana",
          rowId: "topup-dana",
        },
        {
          title: "OVO",
          rowId: "topup-ovo",
        },
        {
          title: "Gopay",
          rowId: "topup-gopay",
        },
        {
          title: "Shopee Pay",
          rowId: "topup-shopeepay",
        },
        {
          title: "i - Saku",
          rowId: "topup-isaku",
        },
      ],
    },
  ];
  const listPesan = {
    text: replyMenu,
    title: "Coding Store",
    buttonText: "Cek Harga",
    sections: listProduk,
    viewOnce: true
  };
  await sock.sendMessage(noWa, listPesan, { quoted: messages[0] });
}

module.exports = handleStoreCommand;

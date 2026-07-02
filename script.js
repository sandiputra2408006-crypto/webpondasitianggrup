const toggleBtn =
document.getElementById("toggleMode");


// DARK MODE

toggleBtn.addEventListener("click",()=>{

  document.body.classList.toggle("dark");
  redrawLayoutForCurrentInputs();

});

function redrawLayoutForCurrentInputs() {
  const nx = parseInt(document.getElementById("nx").value);
  const ny = parseInt(document.getElementById("ny").value);
  const xmax = parseFloat(document.getElementById("xmax").value);
  const ymax = parseFloat(document.getElementById("ymax").value);
  const xmaxUnit = document.getElementById("xmaxUnit")?.value || 'cm';
  const ymaxUnit = document.getElementById("ymaxUnit")?.value || 'cm';

  if (isNaN(nx) || isNaN(ny) || isNaN(xmax) || isNaN(ymax)) return;

  const xmax_m = xmaxUnit === 'cm' ? xmax / 100 : xmax;
  const ymax_m = ymaxUnit === 'cm' ? ymax / 100 : ymax;

  if (nx < 1 || ny < 1) return;
  gambarLayout(nx, ny, xmax_m, ymax_m);
}



// SISTEM KONVERSI OTOMATIS DENGAN PERUBAHAN NILAI

function setupAutoConversion(inputId, unitDropdownId, displayId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(unitDropdownId);
  const display = document.getElementById(displayId);
  
  if (!input || !dropdown) return;
  
  // Simpan unit terakhir
  let lastUnit = dropdown.value;
  
  const handleUnitChange = () => {
    const currentUnit = dropdown.value;
    const currentValue = parseFloat(input.value);
    
    if (isNaN(currentValue) || currentValue === '') {
      if (display) display.textContent = '';
      lastUnit = currentUnit;
      return;
    }
    
    // Konversi nilai
    let newValue;
    if (lastUnit === 'cm' && currentUnit === 'm') {
      newValue = currentValue / 100;
    } else if (lastUnit === 'm' && currentUnit === 'cm') {
      newValue = currentValue * 100;
    } else {
      lastUnit = currentUnit;
      return;
    }
    
    // Update input value
    input.value = parseFloat(newValue.toFixed(2));
    lastUnit = currentUnit;
    
    if (display) display.textContent = '';
  };
  
  const handleValueInput = () => {
    const value = parseFloat(input.value);
    if (display && !isNaN(value) && value !== '') {
      const unit = dropdown.value;
      let targetUnit, factor;
      if (unit === 'cm') {
        targetUnit = 'm';
        factor = 0.01;
      } else {
        targetUnit = 'cm';
        factor = 100;
      }
      const converted = (value * factor).toFixed(2);
      display.textContent = `= ${converted} ${targetUnit}`;
    } else if (display) {
      display.textContent = '';
    }
  };
  
  dropdown.addEventListener("change", handleUnitChange);
  input.addEventListener("input", handleValueInput);
}

function setupForceConversion(inputId, unitDropdownId, conversionFactor) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(unitDropdownId);
  
  if (!input || !dropdown) return;
  
  let lastUnit = dropdown.value;
  
  const handleUnitChange = () => {
    const currentUnit = dropdown.value;
    const currentValue = parseFloat(input.value);
    
    if (isNaN(currentValue) || currentValue === '') {
      lastUnit = currentUnit;
      return;
    }
    
    // Konversi nilai
    let newValue;
    if (lastUnit === 'kN' && currentUnit === 'Ton') {
      newValue = currentValue / conversionFactor;
    } else if (lastUnit === 'Ton' && currentUnit === 'kN') {
      newValue = currentValue * conversionFactor;
    } else if (lastUnit === 'kN.m' && currentUnit === 'Ton.m') {
      newValue = currentValue / conversionFactor;
    } else if (lastUnit === 'Ton.m' && currentUnit === 'kN.m') {
      newValue = currentValue * conversionFactor;
    } else {
      lastUnit = currentUnit;
      return;
    }
    
    // Update input value
    input.value = parseFloat(newValue.toFixed(2));
    lastUnit = currentUnit;
  };
  
  dropdown.addEventListener("change", handleUnitChange);
}

// Setup konversi untuk diameter (display only)
document.getElementById("diameter").addEventListener("input", () => {
  const value = parseFloat(document.getElementById("diameter").value);
  const display = document.getElementById("diameterConvert");
  if (display && !isNaN(value) && value !== '') {
    const converted = (value * 0.01).toFixed(2);
    display.textContent = `= ${converted} m`;
  } else if (display) {
    display.textContent = '';
  }
});

// Setup konversi untuk xmax dan ymax dengan perubahan nilai
setupAutoConversion("xmax", "xmaxUnit", "xmaxConvert");
setupAutoConversion("ymax", "ymaxUnit", "ymaxConvert");

// Setup konversi untuk Q Izin (kN <-> Ton)
setupForceConversion("qijin", "satuanQijin", 9.80665);

// Setup konversi untuk Q Cabut (kN <-> Ton)
setupForceConversion("qcabut", "satuanQcabut", 9.80665);

// Setup konversi untuk Beban V (kN <-> Ton)
setupForceConversion("bebanV", "satuanV", 9.80665);

// Setup konversi untuk Momen Mx (kN.m <-> Ton.m)
setupForceConversion("mx", "satuanMx", 9.80665);

// Setup konversi untuk Momen My (kN.m <-> Ton.m)
setupForceConversion("my", "satuanMy", 9.80665);



function getDasarTeoriMetode(metode) {
  switch (metode) {
    case "converse":
      return `
        <b>Dasar Teori Converse-Labarre:</b><br>
        Metode ini berangkat dari asumsi bahwa kapasitas kelompok tiang menurun karena adanya interaksi antar tiang.
        Semakin rapat susunan tiang dan semakin besar diameter tiang dibandingkan jarak antar tiang, maka efisiensi grup akan semakin kecil.
        Dalam metode ini, pengaruh interaksi dinyatakan melalui sudut θ yang dihitung dari perbandingan diameter tiang dengan jarak antar tiang, lalu dikoreksi dengan jumlah tiang pada arah x dan y.
      `;
    case "losangeles":
      return `
        <b>Dasar Teori Los Angeles:</b><br>
        Metode ini menggunakan pendekatan empiris untuk memperkirakan efisiensi grup berdasarkan susunan tiang dalam bentuk grid.
        Prinsip utamanya adalah bahwa setiap tiang dalam kelompok tidak bekerja sepenuhnya independen karena pengaruh tiang-tiang lain di sekitarnya.
        Semakin padat susunan tiang, semakin besar penurunan kapasitas efektif yang terjadi akibat interaksi tersebut.
      `;
    case "seiler":
      return `
        <b>Dasar Teori Seiler-Keeney:</b><br>
        Metode ini memakai pendekatan praktis dengan nilai efisiensi grup yang dianggap tetap, biasanya sekitar 0,85.
        Dasar teorinya adalah bahwa untuk kondisi tertentu, pengaruh interaksi antar tiang dapat dianggap cukup seragam sehingga efisiensi grup dapat diperkirakan dengan faktor konstan.
        Metode ini sering dipakai untuk perhitungan awal karena lebih sederhana dan cepat.
      `;
    default:
      return "";
  }
}

function hitung(){

  console.log("=== HITUNG DIMULAI ===");

  const D =
  parseFloat(document.getElementById("diameter").value);

  const qijin =
  parseFloat(document.getElementById("qijin").value);

  const satuanQijin =
  document.getElementById("satuanQijin").value;

  const qcabut =
  parseFloat(document.getElementById("qcabut").value);

  const satuanQcabut =
  document.getElementById("satuanQcabut").value;

  const V =
  parseFloat(document.getElementById("bebanV").value);

  const satuanV =
  document.getElementById("satuanV").value;

  const Mx =
  parseFloat(document.getElementById("mx").value);

  const satuanMx =
  document.getElementById("satuanMx").value;

  const My =
  parseFloat(document.getElementById("my").value);

  const satuanMy =
  document.getElementById("satuanMy").value;

  const nx =
  parseInt(document.getElementById("nx").value);

  const ny =
  parseInt(document.getElementById("ny").value);

  const x1 =
  parseInt(document.getElementById("x1").value);

  const y1 =
  parseInt(document.getElementById("y1").value);

  const xmax =
  parseFloat(document.getElementById("xmax").value);

  const ymax =
  parseFloat(document.getElementById("ymax").value);

  const selimut =
  parseFloat(document.getElementById("selimut").value);

  const xmaxUnit = document.getElementById("xmaxUnit")? document.getElementById("xmaxUnit").value : 'cm';
  const ymaxUnit = document.getElementById("ymaxUnit")? document.getElementById("ymaxUnit").value : 'cm';

  const D_m = D/100;

  const toTon = (nilai, satuan) => satuan === "kN" ? nilai / 9.80665 : nilai;
  const toTonMeter = (nilai, satuan) => satuan === "kN.m" ? nilai / 9.80665 : nilai;

  const qijinTon = toTon(qijin, satuanQijin);
  const qcabutTon = toTon(qcabut, satuanQcabut);
  const VTon = toTon(V, satuanV);
  const MxTonMeter = toTonMeter(Mx, satuanMx);
  const MyTonMeter = toTonMeter(My, satuanMy);

  const metode =
  document.getElementById("metode").value;

  console.log("D:", D, "qijin:", qijin, "nx:", nx, "ny:", ny);
  console.log("xmax:", xmax, "ymax:", ymax, "x1:", x1, "y1:", y1);
  console.log("selimut:", selimut);


  if(
    isNaN(D)||
    isNaN(qijin)||
    isNaN(qcabut)||
    isNaN(V)||
    isNaN(Mx)||
    isNaN(My)||
    isNaN(nx)||
    isNaN(ny)||
    isNaN(x1)||
    isNaN(y1)||
    isNaN(xmax)||
    isNaN(ymax)||
    isNaN(selimut)
  ){

    console.error("ERROR: Ada input yang kosong/tidak valid!");
    alert("Semua input harus diisi");

    return;
  }



  const n = nx * ny;

  if (nx < 2 || ny < 2) {
    alert('Jumlah tiang harus >= 2 pada kedua arah untuk grid yang valid');
    return;
  }

  if (x1 < 1 || y1 < 1) {
    alert('Jumlah tiang pada jarak max harus >= 1');
    return;
  }

  // CONVERT XMAX DAN YMAX KE METER TERLEBIH DAHULU
  const xmax_m = xmaxUnit === 'cm' ? xmax/100 : xmax;
  const ymax_m = ymaxUnit === 'cm' ? ymax/100 : ymax;



  // EFISIENSI

  let Eg;
  let rincianEfisiensi = "";
  
  if (metode === "converse") {
    // Untuk Converse, karena input berupa Xmax/Ymax langsung, gunakan estimasi spacing rata-rata
    const estimasiSx = (2 * xmax_m) / (nx > 1 ? (nx - 1) : 1);
    const estimasiSy = (2 * ymax_m) / (ny > 1 ? (ny - 1) : 1);
    const avgSpacing = (estimasiSx + estimasiSy) / 2;
    
    const theta = Math.atan(D_m / avgSpacing) * (180 / Math.PI);

    Eg = 1 - (theta * (((nx - 1) * ny) + ((ny - 1) * nx))) / (90 * nx * ny);
    
    rincianEfisiensi = `
      <b>Metode:</b> Converse-Labarre<br>
      <b>Estimasi Sx:</b> (2 × ${xmax_m.toFixed(3)}) / (${nx} - 1) = ${estimasiSx.toFixed(3)} m<br>
      <b>Estimasi Sy:</b> (2 × ${ymax_m.toFixed(3)}) / (${ny} - 1) = ${estimasiSy.toFixed(3)} m<br>
      <b>Rata-rata Spacing:</b> ${avgSpacing.toFixed(3)} m<br>
      <b>θ:</b> arctan(${D_m.toFixed(3)} / ${avgSpacing.toFixed(3)}) = ${theta.toFixed(2)}°<br>
      <b>Eg:</b> 1 - (${theta.toFixed(2)} × (((${nx} - 1) × ${ny}) + ((${ny} - 1) × ${nx}))) / (90 × ${nx} × ${ny})<br>
      <b>Eg:</b> = 1 - (${theta.toFixed(2)} × ${(((nx - 1) * ny) + ((ny - 1) * nx))}) / ${(90 * nx * ny)}<br>
      <b>Eg:</b> = <b>${Eg.toFixed(3)}</b>
    `;
  }

  else if (metode === "losangeles") {
    const sqrtTerm = Math.sqrt(2 * (nx - 1) * (ny - 1));
    const sumTerm = nx * (ny - 1) + ny * (nx - 1) + sqrtTerm;
    
    Eg = 1 - (
      (D_m / (Math.PI * nx * ny)) * sumTerm
    );
    
    rincianEfisiensi = `
      <b>Metode:</b> Los Angeles<br>
      <b>Sum Term:</b> ${nx} × (${ny} - 1) + ${ny} × (${nx} - 1) + √(2 × (${nx} - 1) × (${ny} - 1))<br>
      <b>Sum Term:</b> = ${nx * (ny - 1)} + ${ny * (nx - 1)} + ${sqrtTerm.toFixed(3)}<br>
      <b>Sum Term:</b> = ${sumTerm.toFixed(3)}<br>
      <b>Eg:</b> 1 - (${D_m.toFixed(3)} / (π × ${nx} × ${ny})) × ${sumTerm.toFixed(3)}<br>
      <b>Eg:</b> = 1 - (${D_m.toFixed(3)} / ${(Math.PI * nx * ny).toFixed(3)}) × ${sumTerm.toFixed(3)}<br>
      <b>Eg:</b> = <b>${Eg.toFixed(3)}</b>
    `;
  }

  else {
    Eg = 0.85;
    rincianEfisiensi = `
      <b>Metode:</b> Seiler-Keeney<br>
      <b>Eg (Fixed):</b> <b>${Eg.toFixed(3)}</b>
    `;
  }



  // HITUNG SIGMA X² DAN SIGMA Y² DENGAN RUMUS YANG BENAR
  // Sigma X² = X1 × Xmax²
  // Sigma Y² = Y1 × Ymax²

  const sumX2 = x1 * (xmax_m * xmax_m);
  const sumY2 = y1 * (ymax_m * ymax_m);

  // hindari pembagian dengan nol
  const safeSumX2 = sumX2 === 0 ? 1e-9 : sumX2;
  const safeSumY2 = sumY2 === 0 ? 1e-9 : sumY2;



  // HITUNG GAYA SETIAP TIANG

  let gayaTiang = [];

  // Generate koordinat tiang
  for(let j=0;j<ny;j++){
    for(let i=0;i<nx;i++){
      
      const x = -xmax_m + (i * ((2 * xmax_m) / (nx - 1)));
      const y = -ymax_m + (j * ((2 * ymax_m) / (ny - 1)));

      let Ptiang =
        (VTon/n)
        +
        ((MxTonMeter*y)/safeSumY2)
        +
        ((MyTonMeter*x)/safeSumX2);

      gayaTiang.push(Ptiang);
    }
  }


  // PMAX DAN PMIN

  const Pmax = Math.max(...gayaTiang);

  const Pmin = Math.min(...gayaTiang);



  // KONTROL

  const amanTekan =
  Pmax <= (Eg*qijinTon);

  const amanCabut =
  Math.abs(Pmin)<=qcabutTon;

  // RINCIAN STATUS TEKAN DAN CABUT
  const qTekanAktualisasi = Eg * qijinTon;
  const rincianTekan = `Pmax (${Pmax.toFixed(3)} Ton) <= Eg × Q Izin Tekan (${Eg.toFixed(3)} × ${qijinTon.toFixed(3)}) = ${qTekanAktualisasi.toFixed(3)} Ton → ${amanTekan ? 'AMAN ✅' : 'TIDAK AMAN ❌'}`;
  
  const rincianCabut = `|Pmin| (${Math.abs(Pmin).toFixed(3)} Ton) <= Q Izin Cabut (${qcabutTon.toFixed(3)} Ton) → ${amanCabut ? 'AMAN ✅' : 'TIDAK AMAN ❌'}`;



  // DIMENSI

  // cap dimensions in meters dengan buffer dari input selimut
  const selimutM = selimut / 100; // konversi cm ke m
  const panjang = (2 * ymax_m) + (2 * selimutM);

  const lebar = (2 * xmax_m) + (2 * selimutM);




  // HASIL

  const hasil =
  document.getElementById("hasil");

  hasil.innerHTML = `

    <h3>HASIL PERHITUNGAN</h3>

    <p><b>Total Tiang:</b> ${n}</p>

    <p><b>Konfigurasi:</b> ${nx} x ${ny}</p>

    <p><b>Efisiensi Grup:</b> ${Eg.toFixed(3)}</p>

    <p><b>Konvensi:</b> Σx² = X1 × Xmax², Σy² = Y1 × Ymax²</p>

    <p><b>Xmax:</b> ${xmax_m.toFixed(3)} m</p>

    <p><b>Ymax:</b> ${ymax_m.toFixed(3)} m</p>

    <p><b>X1 (Jumlah tiang pada jarak Xmax):</b> ${x1}</p>

    <p><b>Y1 (Jumlah tiang pada jarak Ymax):</b> ${y1}</p>

    <p><b>Σx² = ${x1} × ${xmax_m.toFixed(3)}² = </b> ${sumX2.toFixed(3)} m⁴</p>

    <p><b>Σy² = ${y1} × ${ymax_m.toFixed(3)}² = </b> ${sumY2.toFixed(3)} m⁴</p>

    <p><b>Pmax:</b> ${Pmax.toFixed(3)} Ton</p>

    <p><b>Pmin:</b> ${Pmin.toFixed(3)} Ton</p>

    <p><b>Jarak Selimut:</b> ${selimut} cm</p>

    <p><b>Panjang Pile Cap:</b>
    ${panjang.toFixed(2)} m
    </p>

    <p><b>Lebar Pile Cap:</b>
    ${lebar.toFixed(2)} m
    </p>

    <p>
    <b>Status Tekan:</b>
    ${amanTekan ? 'AMAN ✅':'TIDAK AMAN ❌'}
    </p>

    <p>
    <b>Status Cabut:</b>
    ${amanCabut ? 'AMAN ✅':'TIDAK AMAN ❌'}
    </p>

    <hr>

    <h3>Rincian Perhitungan</h3>

    <h4>1. Rincian Efisiensi Grup</h4>
    <p>${rincianEfisiensi}</p>

    <h4>Dasar Teori Metode</h4>
    <p>${getDasarTeoriMetode(metode)}</p>

    <h4>2. Pengecekan Status Tekan</h4>
    <p>${rincianTekan}</p>

    <h4>3. Pengecekan Status Cabut</h4>
    <p>${rincianCabut}</p>

    <h4>4. Perhitungan Pmax dan Pmin</h4>

    <p>
    Pmax = V/n + Mx.ymax/Σy² + My.xmax/Σx²
    </p>

    <p>
    = (${VTon.toFixed(3)} Ton/${n})
    +
    (${MxTonMeter.toFixed(3)} Ton.m×${ymax_m.toFixed(3)} m)/${safeSumY2.toFixed(3)} m⁴
    +
    (${MyTonMeter.toFixed(3)} Ton.m×${xmax_m.toFixed(3)} m)/${safeSumX2.toFixed(3)} m⁴
    </p>

    <p>
    = ${Pmax.toFixed(3)} Ton
    </p>

    <br>

    <p>
    Pmin = V/n - Mx.ymax/Σy² - My.xmax/Σx²
    </p>

    <p>
    = (${VTon.toFixed(3)} Ton/${n})
    -
    (${MxTonMeter.toFixed(3)} Ton.m×${ymax_m.toFixed(3)} m)/${safeSumY2.toFixed(3)} m⁴
    -
    (${MyTonMeter.toFixed(3)} Ton.m×${xmax_m.toFixed(3)} m)/${safeSumX2.toFixed(3)} m⁴
    </p>

    <p>
    = ${Pmin.toFixed(3)} Ton
    </p>

  `;

  console.log("✓ Hasil HTML sudah di-generate");
  console.log("✓ Pmax:", Pmax, "Pmin:", Pmin);

  gambarLayout(nx, ny, xmax_m, ymax_m);

  console.log("=== HITUNG SELESAI ===");

}




function gambarLayout(nx, ny, xmax_m, ymax_m){

  const canvas =
  document.getElementById("layoutCanvas");

  const ctx =
  canvas.getContext("2d");


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const spacing = 90;
  const capWidth = ((nx - 1) * spacing) + 100;
  const capHeight = ((ny - 1) * spacing) + 100;
  const startX = Math.round((canvas.width - capWidth) / 2) + 50;
  const startY = Math.round((canvas.height - capHeight) / 2) - 20;
  const actualWidth = (2 * xmax_m).toFixed(2);
  const actualHeight = (2 * ymax_m).toFixed(2);
  const spacingX = nx > 1 ? ((2 * xmax_m) / (nx - 1)).toFixed(2) : '0.00';
  const spacingY = ny > 1 ? ((2 * ymax_m) / (ny - 1)).toFixed(2) : '0.00';

  const drawArrow = (x1, y1, x2, y2) => {
    const arrowSize = 6;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle - Math.PI / 6),
      y2 - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle + Math.PI / 6),
      y2 - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  // pile cap
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    startX - 50,
    startY - 50,
    capWidth,
    capHeight
  );

  // tiang
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = startX + (i * spacing);
      const y = startY + (j * spacing);

      ctx.beginPath();
      ctx.arc(
        x,
        y,
        18,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // dimensions
  const isDarkMode = document.body.classList.contains("dark");
  const dimColor = isDarkMode ? "#FFFFFF" : "#1a1a1a";
  ctx.strokeStyle = dimColor;
  ctx.fillStyle = dimColor;
  ctx.lineWidth = 1.5;
  ctx.font = "14px Arial";

  const dimY = startY + capHeight + 55;
  ctx.beginPath();
  ctx.moveTo(startX - 50, dimY);
  ctx.lineTo(startX - 50 + capWidth, dimY);
  ctx.stroke();
  drawArrow(startX - 50 + capWidth, dimY, startX - 50, dimY);
  drawArrow(startX - 50, dimY, startX - 50 + capWidth, dimY);
  ctx.textAlign = "center";
  ctx.fillText(`Lebar = ${actualWidth} m`, startX - 50 + capWidth / 2, dimY + 22);
  ctx.fillText(`Sx = ${spacingX} m`, startX - 50 + capWidth / 2, dimY + 40);

  const dimX = startX - 60;
  ctx.beginPath();
  ctx.moveTo(dimX, startY - 50);
  ctx.lineTo(dimX, startY - 50 + capHeight);
  ctx.stroke();
  drawArrow(dimX, startY - 50 + capHeight, dimX, startY - 50);
  drawArrow(dimX, startY - 50, dimX, startY - 50 + capHeight);
  ctx.textAlign = "right";
  ctx.fillText(`Panjang = ${actualHeight} m`, dimX - 10, startY + capHeight / 2 - 8);
  ctx.fillText(`Sy = ${spacingY} m`, dimX - 10, startY + capHeight / 2 + 12);

  if (nx > 1) {
    const x1 = startX;
    const x2 = startX + spacing;
    const labelY = startY - 30;
    ctx.beginPath();
    ctx.moveTo(x1, labelY);
    ctx.lineTo(x2, labelY);
    ctx.stroke();
    drawArrow(x1, labelY, x2, labelY);
    drawArrow(x2, labelY, x1, labelY);
    ctx.textAlign = "center";
    ctx.fillText(`Jarak antar tiang X = ${spacingX} m`, (x1 + x2) / 2, labelY - 8);
  }

  if (ny > 1) {
    const y1 = startY;
    const y2 = startY + spacing;
    const labelX = startX - 40;
    ctx.beginPath();
    ctx.moveTo(labelX, y1);
    ctx.lineTo(labelX, y2);
    ctx.stroke();
    drawArrow(labelX, y1, labelX, y2);
    drawArrow(labelX, y2, labelX, y1);
    ctx.textAlign = "left";
    ctx.fillText(`Jarak antar tiang Y = ${spacingY} m`, labelX - 120, (y1 + y2) / 2 + 5);
  }
}



async function exportPDF(){


  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const area = document.getElementById("hasilArea");
  const scale = 2;

  const canvas = await html2canvas(area, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const areaRect = area.getBoundingClientRect();
  const layoutCanvas = document.getElementById("layoutCanvas");
  const layoutRect = layoutCanvas.getBoundingClientRect();
  const layoutTopPx = Math.round((layoutRect.top - areaRect.top) * scale);
  const layoutHeightPx = Math.round(layoutRect.height * scale);
  const layoutBottomPx = layoutTopPx + layoutHeightPx;

  const imgData = canvas.toDataURL("image/png");
  const pdfWidth = 190;
  const pageHeight = pdf.internal.pageSize.getHeight() - 20;
  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;
  const pageHeightPx = pageHeight * (imgWidthPx / pdfWidth);

  let currentY = 0;
  let pageIndex = 0;

  while (currentY < imgHeightPx) {
    let sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - currentY);

    if (currentY < layoutTopPx && currentY + sliceHeightPx > layoutTopPx) {
      sliceHeightPx = layoutTopPx - currentY;
    }

    if (sliceHeightPx <= 0) {
      sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - currentY);
    }

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = imgWidthPx;
    pageCanvas.height = sliceHeightPx;
    const pageCtx = pageCanvas.getContext('2d');

    pageCtx.drawImage(
      canvas,
      0,
      currentY,
      imgWidthPx,
      sliceHeightPx,
      0,
      0,
      imgWidthPx,
      sliceHeightPx
    );

    const pageData = pageCanvas.toDataURL('image/png');
    const pageHeightMm = (sliceHeightPx * pdfWidth) / imgWidthPx;

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(pageData, 'PNG', 10, 10, pdfWidth, pageHeightMm);

    currentY += sliceHeightPx;
    pageIndex += 1;
  }

  pdf.save(
    "hasil-pondasi-tiang.pdf"
  );

}


function isiContohSoal(){

  document.getElementById("diameter").value = 30;
  document.getElementById("qijin").value = 32;
  document.getElementById("satuanQijin").value = "Ton";
  document.getElementById("qcabut").value = 10;
  document.getElementById("satuanQcabut").value = "Ton";
  document.getElementById("bebanV").value = 120;
  document.getElementById("satuanV").value = "Ton";
  document.getElementById("mx").value = 35;
  document.getElementById("satuanMx").value = "Ton.m";
  document.getElementById("my").value = 40;
  document.getElementById("satuanMy").value = "Ton.m";
  document.getElementById("nx").value = 4;
  document.getElementById("ny").value = 3;
  document.getElementById("x1").value = 8;
  document.getElementById("y1").value = 9;
  document.getElementById("xmax").value = 150;
  document.getElementById("ymax").value = 150;
  document.getElementById("selimut").value = 25;

  const xmaxUnit = document.getElementById("xmaxUnit");
  const ymaxUnit = document.getElementById("ymaxUnit");

  if (xmaxUnit) xmaxUnit.value = "cm";
  if (ymaxUnit) ymaxUnit.value = "cm";

}
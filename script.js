let items = [
  { desc: 'Website Design & Development', qty: 1, price: 2500 },
  { desc: 'Brand Identity Package', qty: 1, price: 800 },
  { desc: 'Monthly Maintenance', qty: 3, price: 150 },
];

function fmt(n) {
  const cur = document.getElementById('currency').value || '$';
  return cur + Number(n).toFixed(2);
}

function renderItems() {
  const container = document.getElementById('itemsContainer');
  container.innerHTML = '';
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" value="${item.desc}" placeholder="Description" oninput="items[${i}].desc=this.value;update()" style="font-size:0.8rem">
      <input type="number" value="${item.qty}" min="1" oninput="items[${i}].qty=+this.value;update()" style="font-size:0.8rem">
      <input type="number" value="${item.price}" min="0" step="0.01" oninput="items[${i}].price=+this.value;update()" style="font-size:0.8rem">
      <button class="btn-remove" onclick="removeItem(${i})">×</button>
    `;
    container.appendChild(row);
  });
}

function addItem() {
  items.push({ desc: '', qty: 1, price: 0 });
  renderItems();
  update();
}

function removeItem(i) {
  items.splice(i, 1);
  renderItems();
  update();
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function update() {
  const g = id => document.getElementById(id).value;
  const s = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  s('p-fromName', g('fromName') || 'Your Business');
  s('p-fromTagline', g('fromTagline'));
  s('p-fromNameB', g('fromName') || 'Your Business');
  s('p-fromDetails', g('fromDetails'));
  s('p-toName', g('toName') || 'Client Name');
  s('p-toDetails', g('toDetails'));
  s('p-invNumber', g('invNumber') || '—');
  s('p-issueDate', formatDate(g('issueDate')));
  s('p-dueDate', formatDate(g('dueDate')));
  s('p-footerBrand', g('fromName') || 'Your Business');

  const notesEl = document.getElementById('p-notes');
  notesEl.innerHTML = `<strong>Notes</strong>${g('notes') || ''}`;

  const subtotal = items.reduce((sum, it) => sum + (it.qty * it.price), 0);
  const taxRate = parseFloat(g('taxRate')) || 0;
  const discountValue = parseFloat(g('discountValue')) || 0;
  const discountType = g('discountType');

  let discountAmount = 0;
  if (discountValue > 0) {
    discountAmount = discountType === 'percent' ? subtotal * discountValue / 100 : discountValue;
  }

  const discounted = subtotal - discountAmount;
  const tax = discounted * taxRate / 100;
  const total = discounted + tax;

  s('p-subtotal', fmt(subtotal));
  s('p-tax', fmt(tax));
  s('p-total', fmt(total));
  s('p-amountDue', fmt(total));
  s('p-taxLabel', `Tax (${taxRate}%)`);

  const discRow = document.getElementById('p-discountRow');
  if (discountValue > 0) {
    discRow.style.display = 'flex';
    s('p-discountLabel', discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount');
    s('p-discount', '−' + fmt(discountAmount));
  } else {
    discRow.style.display = 'none';
  }

  const tbody = document.getElementById('p-items');
  tbody.innerHTML = '';
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="desc-cell">${item.desc || '—'}</td>
      <td>${item.qty}</td>
      <td>${fmt(item.price)}</td>
      <td>${fmt(item.qty * item.price)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function downloadPDF() {
  const el = document.getElementById('invoice');
  const fromName = document.getElementById('fromName').value || 'invoice';
  const invNum = document.getElementById('invNumber').value || 'invoice';
  const filename = `${fromName.replace(/\s+/g,'-')}_${invNum}.pdf`;

  const opt = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fff9ef' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(el).save();
}

const today = new Date();
const due = new Date(today); due.setDate(due.getDate() + 30);
const fmt2 = d => d.toISOString().split('T')[0];
document.getElementById('issueDate').value = fmt2(today);
document.getElementById('dueDate').value = fmt2(due);

renderItems();
update();

import { convert } from 'number-to-cyrillic';
let textareasAll = document.querySelectorAll('.form-group textarea');
let textareasPrice = document.querySelectorAll('.price textarea');

console.log(convert(21345))
console.log(convert(12574.56))


//Перерахунок при зміні фокусу та натисканні Enter
textareasAll.forEach((textarea, index) => {
  textarea.addEventListener('focus', function (e) {
    if (e.target.classList.contains('error')) {
      e.target.value = '';
      e.target.classList.remove('error');
    }
  });



  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      let nextIndex = index + 1;
      if (nextIndex < textareasAll.length) {
        textareasAll[nextIndex].focus();
        calcValue()
      } else {
        textarea.blur();
        calcValue()
      }
    }
  });
});



//Валідація та заміна символів
textareasPrice.forEach((textarea) => {

  textarea.addEventListener('blur', function (e) {
    let value = e.target.value;
    value = value.replace(/,/g, '.')
    let validValue = value.match(/^\d*\.?\d*$/);


    if (!validValue) {
      e.target.value = 'Будь ласка, введіть коректне значення';
      e.target.classList.add('error');
    } else {
      e.target.classList.remove('error');
      if (/^\d*\.?\d+$/.test(value)) {
        let roundedValue = parseFloat(value).toFixed(2);
        e.target.value = roundedValue;
        calcValue()
      }
    }
  });
});

//Розрахункова дата
document.getElementById('calculation').valueAsDate = new Date();

//Розрахунок різниці між датами
function calculateDifference() {
  const commissioning = new Date(document.getElementById('commissioning').value);
  const calculation = new Date(document.getElementById('calculation').value);

  if (isNaN(commissioning) || isNaN(calculation)) {
    document.getElementById('result').innerText = "Будь ласка, введіть коректну дату";
    return;
  }

  let months;
  months = (calculation.getFullYear() - commissioning.getFullYear()) * 12;
  months -= commissioning.getMonth();
  months += calculation.getMonth();
  if (calculation.getDate() < commissioning.getDate()) {
    months--;
  }
  months = Math.floor(months);


  document.getElementById('result').innerText = `${months} місяців у використанні`;
  toTmax()
}

//Курс на день купівлі при зміні фокусу з дати вводу в експлуатацію
document.getElementById('commissioning').addEventListener('blur', function (e) {
  calculateDifference();
  fetchData('commissioning', 'rateOld');
  setTimeout(rateKof, 2000);
  calcValue()
})

//Курс на день продажу при зміні фокусу з дати розрахунку
document.getElementById('calculation').addEventListener('blur', function (e) {
  calculateDifference()
  fetchData('calculation', 'rateNow')
  setTimeout(rateKof, 2000);
  calcValue()
})

//Розрахунок Максимального терміну експлуатації
document.getElementById('tgar').addEventListener('blur', function (e) {
  let valueTgar = e.target.value;
  let validValue = valueTgar.match(/^\d+$/);
  let valueTmax = document.getElementById('tmax')


  if (!validValue) {
    valueTmax.value = 'Будь ласка, введіть коректне значення';
    valueTmax.classList.add('error');
  } else {
    valueTmax.classList.remove('error');
    if (/^\d+$/.test(valueTgar)) {
      valueTmax.value = valueTgar * 1.5;
      toTmax()
    }
  }
})

// Кофіцієнт Макс терміну есплуатаціїї (від Текс) = мінімальному кофіцієнту (Кмін)
document.getElementById('fromTmax').value = document.getElementById('kmin').value

//Розрахунок курсу на певну дату
function fetchData(elementId, elementIdRate) {
  const dateInput = document.getElementById(elementId).value;
  if (dateInput) {
    const formattedDate = dateInput.replace(/-/g, '');
    const url = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=USD&date=${formattedDate}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        // console.log(data[0].rate)
        const rate = data[0].rate;
        const roundedRate = rate.toFixed(2);
        // document.getElementById('rateOld').value = roundedRate;
        putRate(elementIdRate, roundedRate)
      })
      .catch(error => console.error('Ошибка:', error));
  } else {
    alert('Пожалуйста, выберите дату.');
  }
}

//Встановлення курсу
function putRate(elementIdRate, roundedRate) {
  document.getElementById(elementIdRate).value = roundedRate;
}

//кофіцієнт курсу валют
function rateKof() {
  const rateNow = parseFloat(document.getElementById('rateNow').value)
  const rateOld = parseFloat(document.getElementById('rateOld').value)

  if (!isNaN(rateNow) && !isNaN(rateOld) && rateOld !== 0) {
    const result = rateNow / rateOld;
    document.getElementById('rateK').value = result.toFixed(2)
  } else {
    console.error('Ошибка: Неверные значения или деление на ноль.');
  }
}

//Розрахунок коф до Максимального терміну експлуатації. Встановлення основного кофіцієнту Кст
function toTmax() {
  // let resultValue = document.getElementById('toTmax').value
  let k = parseFloat(document.getElementById('result').value)
  let z = parseFloat(document.getElementById('kmin').value)
  let y = parseFloat(document.getElementById('kgar').value)
  let p = parseFloat(document.getElementById('tmax').value)
  let o = parseFloat(document.getElementById('tgar').value)
  let zDec = z / 100
  let yDec = y / 100;
  let resToTmax = ((k * (zDec - yDec) + yDec * p - zDec * o) / (p - o)) * 100
  let resToTgar = (k * (yDec - 1) / o + 1) * 100
  if (k < o) {
    document.getElementById('kst').innerText = `${resToTgar.toFixed(1)}%`
  } else if (k < p) {
    document.getElementById('kst').innerText = `${resToTmax.toFixed(1)}%`
  } else {
    document.getElementById('kst').innerText = `${z.toFixed(1)}%`
  }

  document.getElementById('toTgar').innerText = `${resToTgar.toFixed(1)}%`
  document.getElementById('toTmax').innerText = `${resToTmax.toFixed(1)}%`
  // console.log(resToTmax, resToTgar)
}

//Розрахункова та продажна вартість
function calcValue() {
  let result;
  let e = parseFloat(document.getElementById('priceBuy').value);
  let q = parseFloat(document.getElementById('kst').value);
  let g = parseFloat(document.getElementById('repCost').value);
  g = g || 0
  let f = parseFloat(document.getElementById('resCost').value);
  f = f || 0
  let z = parseFloat(document.getElementById('kmin').value);
  let u = parseFloat(document.getElementById('kn').value);
  const rateNow = parseFloat(document.getElementById('rateNow').value)
  const rateOld = parseFloat(document.getElementById('rateOld').value)

  let v = rateNow / rateOld;
  let zDec = z / 100;
  let qDec = q / 100;

  if (e * qDec - g < e * zDec) {
    result = e * zDec
  } else {
    result = e * qDec - g
  }

  let calcCount = result * u * v
  document.getElementById('calcValue').value = calcCount.toFixed(2)
  let sellValue
  sellValue = calcCount > f * 1.01 ? calcCount : f * 1.01
  document.getElementById('sellCost').value = sellValue.toFixed(2)
  let lastSum = sellValue * 1.2
  document.getElementById('lastSum').textContent = lastSum.toFixed(2)

  // let lastValue
  // lastValue = calcCount * 1.2
  // document.getElementById('lastValue').value = lastValue.toFixed(2)
}

//приховати нобовязкові поля при друці
document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("repCost");
  const place1 = document.getElementById("repCostPlace");
  const place2 = document.getElementById("repDescriptionPlace");

  const span1 = document.getElementById("repCostSpan");
  const span2 = document.getElementById("repDescriptionSpan");


  const togglePrintVisibility = () => {
    if (!textarea.value.trim()) {
      place1.classList.add("no-print");
      place2.classList.add("no-print");

      span1.classList.add("no-print");
      span2.classList.add("no-print");

    } else {
      place1.classList.remove("no-print");
      place2.classList.remove("no-print");

      span1.classList.remove("no-print");
      span2.classList.remove("no-print");

    }
  };

  togglePrintVisibility();

  textarea.addEventListener("input", togglePrintVisibility);
});


//відображення форми чи рахунку
document.addEventListener("DOMContentLoaded", () => {
  const toggleViewCheckbox = document.getElementById("toggleView");
  const asideElement = document.querySelector(".titles");
  const sectionElement = document.querySelector(".values");
  const priceBuyTextarea = document.getElementById("priceBuy");
  const dateCalculation = document.getElementById("calculation");

  const newElementsContainer = document.getElementById("newElementsContainer");

  const toggleView = () => {
    const isChecked = toggleViewCheckbox.checked;

    asideElement.classList.toggle("hidden", isChecked);
    sectionElement.classList.toggle("hidden", isChecked);

    if (isChecked) {
      const priceBuyValue = priceBuyTextarea.value.trim();
      const originalDate = dateCalculation.value.trim();
      const [year, month, day] = originalDate.split('-');
      const formattedDate = `${day}.${month}.${year}`;

      document.getElementById('formattedDate').textContent = formattedDate;
      console.log(originalDate, formattedDate)


      // Создаем новые элементы
      // newElementsContainer.innerHTML = `
      //   <article class="bill">
      //     <h2>Рахунок № &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; від ${formattedDate || "Немає даних"}</h2>
      //     <p>Місце складання: м. Київ</p>

      //     <label for="provider">Постачальник:</label>
      //     <select id="provider" name="provider">
      //       <option value="test1">ТОВ "Рога"</option>
      //       <option value="test2">ООО "Копита"</option>
      //     </select>

      //     <p id="description"></p>

      //     <p>Значення з priceBuy: ${priceBuyValue || "Немає даних"}</p>
      //   </article>
      // `;

      newElementsContainer.classList.remove("hidden");
    } else {
      newElementsContainer.classList.add("hidden");
    }
  };

  toggleViewCheckbox.addEventListener("change", toggleView);
});


//випадаючий список підприємств
document.getElementById('provider').addEventListener('change', function () {
  const selectedValue = this.value;
  const description = document.getElementById('description');
  console.log(description, selectedValue)

  if (selectedValue === 'test1') {
    description.innerHTML = 'р/р IBAN UA963052990000004149123456789, Bank JSC CB PRIVATBANK, МФО 305299 <br>' + '36000 Dnipropetrovsak vul.Naberezhna Peremohy, 50, tel: +38 099 333 22 11 <br>' + 'kod EDRPOU 39000XXX, IPN 10XX10XX10';
  } else if (selectedValue === 'test2') {
    description.innerHTML = 'р/р IBAN UA683348510000004149123456787, Bank JSC FUIB, МФО 334851 <br>' +
      '04070, Kyiv vul.Andriyivska, 4, tel: +38 099 555 66 77 <br>' +
      'kod EDRPOU 21000YYY, IPN 20YY20YY20';
  } else if (selectedValue === 'test3') {
    description.innerHTML = 'Умовний текст при виборі варіанту тест 3';
  }
});

// Функція для оновлення тексту в numToText
function updateNumToText() {
  const lastSumElement = document.getElementById('lastSum');
  const sumValue = parseFloat(lastSumElement.textContent); // Перетворюємо текст на число

  // Перевіряємо, чи значення валідне
  if (!isNaN(sumValue)) {
    const convertedSum = convert(sumValue);

    // Форматуємо результат
    const fullText = `${convertedSum.convertedInteger} ${convertedSum.integerCurrency}, ${convertedSum.convertedFractional} ${convertedSum.fractionalCurrency}`;

    // Виводимо текст у елемент numToText
    const numToTextElement = document.getElementById('numToText');
    numToTextElement.textContent = fullText;
  } else {
    console.warn('Невірне значення в lastSum!');
  }
}

// Викликаємо оновлення, коли змінюється сума викупу
const lastSumElement = document.getElementById('lastSum');
const observer = new MutationObserver(() => {
  updateNumToText();
});

observer.observe(lastSumElement, { characterData: true, subtree: true, childList: true });

// Функція для оновлення значень у <p class="item">
function updateItemDetails() {
  // Отримання значень із текстових полів
  const invNum = document.getElementById('itemInvNum').value.trim();
  const serialNum = document.getElementById('itemSerialNum').value.trim();
  const name = document.getElementById('itemName').value.trim();
  const price = document.getElementById('sellCost').value.trim();
  const lastPrice = document.getElementById('lastSum').textContent.trim();

  // Оновлення відповідних <span>
  document.querySelector('.itemInvNum').textContent = invNum || '—';
  document.querySelector('.itemSerialNum').textContent = serialNum || '—';
  document.querySelector('.itemName').textContent = name || '—';
  document.querySelector('.itemPrice').textContent = price || '—';
  document.querySelector('.itemLastPrice').textContent = lastPrice || '—';
}

// Додаємо слухачі подій для оновлення при зміні значень у полях
document.getElementById('itemInvNum').addEventListener('input', updateItemDetails);
document.getElementById('itemSerialNum').addEventListener('input', updateItemDetails);
document.getElementById('itemName').addEventListener('input', updateItemDetails);

// Оновлення ціни автоматично, якщо значення в "lastSum" змінюється
const monitor = new MutationObserver(updateItemDetails);
monitor.observe(document.getElementById('lastSum'), { childList: true, characterData: true });



window.onload = fetchData('calculation', 'rateNow')
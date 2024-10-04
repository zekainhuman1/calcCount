let textareasAll = document.querySelectorAll('.form-group textarea');
let textareasPrice = document.querySelectorAll('.price textarea');

console.log(textareasAll)

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




textareasPrice.forEach((textarea) => {

  textarea.addEventListener('blur', function (e) {
    let value = e.target.value;
    let validValue = value.match(/^\d*\.?\d{0,2}$/);

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

document.getElementById('calculation').valueAsDate = new Date();

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
  months = Math.round(months);

  document.getElementById('result').innerText = `${months} місяців у використанні`;
  toTmax()
}


document.getElementById('commissioning').addEventListener('blur', function (e) {
  calculateDifference();
  fetchData('commissioning', 'rateOld');

  setTimeout(rateKof, 2000);
  calcValue()
})

document.getElementById('calculation').addEventListener('blur', function (e) {
  calculateDifference()
  fetchData('calculation', 'rateNow')
  setTimeout(rateKof, 2000);
  calcValue()

})

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

document.getElementById('fromTmax').value = document.getElementById('kmin').value

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

function putRate(elementIdRate, roundedRate) {
  document.getElementById(elementIdRate).value = roundedRate;
}

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
  console.log(resToTmax, resToTgar)
}

function calcValue() {
  let result;
  let e = parseFloat(document.getElementById('priceBuy').value);
  let q = parseFloat(document.getElementById('kmin').value);
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
  console.log(sellValue)
}


window.onload = fetchData('calculation', 'rateNow')
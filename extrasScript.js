const APIkey = '613c9cc0b1mshc6eee203ef52be2p1c5d88jsn989d0da3e195';


$(function(){
    load();
})

export function load(){
    $(document).on('click', '#logout', function(){handleLogOut(this)});
    $(document).on('click', '#randomTrack', function(){generateRandomTrack(this)});
    $(document).on('click', '#jokeButton', function(){generateJoke(this)});
    generateCurrentForecast()
    setUpPaymentProcessing();
}

export function getRandomSearch(){
    const characters = 'abcedfghijklmnopqrstuvwxyz';
    const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));

    let randomSearch = '';
    switch(Math.round(Math.random())){
        case 0:
            randomSearch = randomCharacter + '%25';
            break;
        case 1:
            randomSearch = '%25' + randomCharacter + '%25';
            break;
    }

    return randomSearch;
}

export function generateRandomTrack(event){
    fetch("https://deezerdevs-deezer.p.rapidapi.com/search?q=" + getRandomSearch(),{
        "method": "GET",
        "headers":{
            "x-rapidapi-key": APIkey,
		    "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com"
        }
    }).then(response =>{
        return response.json()
    }).then(data =>{
        let offset = Math.floor(Math.random() * 25);
        let trackId = data.data[offset].id;
        document.getElementById("player").innerHTML = `<iframe title="deezer-widget" src="https://widget.deezer.com/widget/dark/track/${trackId}" width="100%" height="300" frameborder="0" allowtransparency="true" allow="encrypted-media; clipboard-write"></iframe>
        <button class="button" id="randomTrack">Generate Random Track</button>`
    })
    .catch(error =>{
        console.log(error);
    });
}

export function setUpPaymentProcessing(){
    const baseRequest = {
        apiVersion: 2, 
        apiVersionMinor: 0
    };
    const tokenizationSpecification = {
        type: 'PAYMENT_GATEWAY',
        parameters: {
            'gateway': 'stripe',
            'stripe:version': "2018-10-31",
            'stripe:publishableKey': 'pk_live_51IohfAClyJKmmwVuC3QoCH0USnSyJhTeLiIDVZvN8Wd5UZxQYgkddITI3eWXjf1AzWcrNZ8hwRqd50MnBUUZ5070003BZYMZIz'
        }
    };
    const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
    const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];
    const baseCardPaymentMethod = {
        type: 'CARD',
        parameters: {
            allowedAuthMethods: allowedCardAuthMethods,
            allowedCardNetworks: allowedCardNetworks
        }
    };
    const cardPaymentMethod = Object.assign(
        {tokenizationSpecification: tokenizationSpecification},
        baseCardPaymentMethod
    );
    const paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});
    const isReadyToPayRequest = Object.assign({}, baseRequest);
    isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];
    paymentsClient.isReadyToPay(isReadyToPayRequest)
    .then(function(response) {
      if (response.result) {
        const button = paymentsClient.createButton({
            buttonColor: 'black',
            buttonType: 'donate',
            onClick: () => {
                paymentsClient.loadPaymentData(paymentDataRequest).then(function(paymentData){
                // if using gateway tokenization, pass this token without modification
                paymentToken = paymentData.paymentMethodData.tokenizationData.token;
                }).catch(function(err){
                // show error in developer console for debugging
                console.error(err);
                });},
          });
          
        document.getElementById('payMe').append(button);
      }
    })
    .catch(function(err) {
      // show error in developer console for debugging
      console.error(err);
    });
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.transactionInfo = {
        totalPriceStatus: 'FINAL',
        totalPrice: '123.45',
        currencyCode: 'USD',
        countryCode: 'US'
    };
    paymentDataRequest.merchantInfo = {
        merchantName: 'Movie Taste Comparer',
        merchantId: 'BCR2DN6TV7U6P32V'
    };
}

export function generateJoke(event){
    fetch("https://jokeapi-v2.p.rapidapi.com/joke/Any?format=json&blacklistFlags=nsfw%2Cracist%2Csexist%2Creligious", {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": "613c9cc0b1mshc6eee203ef52be2p1c5d88jsn989d0da3e195",
		"x-rapidapi-host": "jokeapi-v2.p.rapidapi.com"
	}
    })
    .then(response => {
        return response.json();
    })
    .then(data =>{
        document.getElementById("joke").innerHTML = `<p>${data.setup}</p><p>${data.delivery}</p>`;
    })
    .catch(err => {
        console.error(err);
    });
}

export function generateCurrentForecast(){
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Chapel Hill&units=imperial&appid=b677d9f08754461d7626bca75bc7a2a8`)
    .then(result=>{
        return result.json();
    })
    .then(data =>{
        document.getElementById("forecast").innerHTML = `<p>Current Temperature: ${data.main.temp} degrees</p>
        <p>Feels Like: ${data.main.feels_like}</p>
        <p>${data.weather[0].description}</p>`;
    })
    .catch(error =>{
        console.log(error);
    })
}

export function handleLogOut(event){
    auth.signOut()
    .then(()=>{
        window.location.href = 'index.html';
    });
}
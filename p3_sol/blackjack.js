let id_mazo;
// manos
let mano_jugador = [];
let mano_dealer = [];
let estado_juego = '';

async function crearMazo() {
    try {
        const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const data = await response.json();
        id_mazo = data.deck_id;
    } catch (error) {
        console.error('Error al crear el mazo:', error);
    }
}

async function restart() {
    mano_dealer = [];
    mano_jugador = [];
    document.getElementById("cartas_jugador").innerHTML = "";
    document.getElementById("cartas_dealer").innerHTML = "";
    
    document.getElementById('puntos_jugador').textContent = 'Puntos: ';
    document.getElementById('puntos_dealer').textContent = 'Puntos: ';
    document.getElementById('mensajes').textContent = 'En juego';
    document.getElementById('vacile').innerHTML = '';
    estado_juego = '';  // Resetear estado

    await crearMazo();
    await cartasIniciales();
    estado_juego = 'jugando';
}

async function cartasIniciales() {
    try {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${id_mazo}/draw/?count=4`);
        const data = await response.json();

        mano_jugador.push(data.cards[0], data.cards[1]);
        await animarCarta(data.cards[0], 'jugador', true);
        await animarCarta(data.cards[1], 'jugador', true);
        document.getElementById('puntos_jugador').textContent = `Puntos: ${calcularPuntuacion(mano_jugador)}`;

        mano_dealer.push(data.cards[2], data.cards[3]);
        await animarCarta(data.cards[2], 'dealer', false);
        await animarCarta(data.cards[3], 'dealer', true);
        document.getElementById('puntos_dealer').textContent = `Puntos: ?+${calcularPuntuacion([data.cards[3]])}`; 

    } catch (error) {
        console.error('Error al repartir cartas:', error);
    }
}

async function pillarCarta(destino) {
    if (estado_juego !== 'jugando') return;

    try {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${id_mazo}/draw/?count=1`);
        const data = await response.json();

        if (destino === 'jugador') {
            mano_jugador.push(data.cards[0]);
            await animarCarta(data.cards[0], 'jugador', true);
            const puntuacion_jugador = calcularPuntuacion(mano_jugador);
            document.getElementById('puntos_jugador').textContent = `Puntos: ${puntuacion_jugador}`;
           

            if (puntuacion_jugador >= 21) {
                resolverJuego();
            }
        } else {
            mano_dealer.push(data.cards[0]);
            await animarCarta(data.cards[0], 'dealer', true);
        }
    } catch (error) {
        console.error('Error al pedir carta:', error);
    }
}

function pedirCarta() {
    if (estado_juego === 'jugando') {
        pillarCarta('jugador');
    }
}

async function resolverJuego() {
    if (estado_juego !== 'jugando') return;
    let puntuacion_dealer = calcularPuntuacion(mano_dealer);
    const puntuacion_jugador = calcularPuntuacion(mano_jugador);
    let ganador = '';

    while (puntuacion_dealer < 17) {
        await pillarCarta('dealer');
        puntuacion_dealer = calcularPuntuacion(mano_dealer);
        
    }

    estado_juego = 'finalizado';
    document.getElementById('puntos_dealer').textContent = `Puntos: ${puntuacion_dealer}`;
    await desvelar_Dealer();
    if (puntuacion_dealer > 21 && puntuacion_jugador > 21) {
        ganador = puntuacion_jugador < puntuacion_dealer ? 'jugador' : 'dealer';
    } else if (puntuacion_jugador > 21) {
        ganador = 'dealer';
    } else if (puntuacion_dealer > 21) {
        ganador = 'jugador';
    } else {
        ganador = puntuacion_jugador > puntuacion_dealer ? 'jugador' : 
                  puntuacion_jugador < puntuacion_dealer ? 'dealer' : 'empate';
    }
    await generarEmoji(ganador);

    document.getElementById('mensajes').textContent= `Ganador: ${ganador}`;
}
function generarEmoji(ganador){
  return new Promise((resolve) => {
    let grupo;
    if(ganador === 'jugador'){
      grupo="face-positive";
    }else if(ganador === 'dealer'){
      grupo="face-negative";
    }else{
      grupo="face-neutral";
    }
    fetch(`https://emojihub.yurace.pro/api/random/group/${grupo}`)
    .then(response => response.json()).then(data => {
      document.getElementById('vacile').innerHTML= data.htmlCode;
      resolve();
    })
    .catch(error => console.error('Error al generar emoji:', error));
  });
}
function desvelar_Dealer(){
  return new Promise((resolve) => {
    const cartas_dealer = document.getElementById('cartas_dealer');
    const cartas = cartas_dealer.querySelectorAll('.carta');

    cartas[0].querySelector('.carta-inner').style.transition = 'transform 0.5s';
    cartas[0].querySelector('.carta-inner').style.transform = 'rotateY(180deg)';

    setTimeout(() => {
        resolve();
    }, 1000);
  });
}

function calcularPuntuacion(mano) {
    let n_ace = 0;
    let puntuacion = 0;

    for (let i = 0; i < mano.length; i++) {
        let valor = mano[i].value;
        if (valor === 'KING' || valor === 'QUEEN' || valor === 'JACK') {
            puntuacion += 10;
        } else if (valor === 'ACE') {
            puntuacion += 11;
            n_ace++;
        } else {
            puntuacion += parseInt(valor);
        }
    }

    while (puntuacion > 21 && n_ace > 0) {
        puntuacion -= 10;
        n_ace--;
    }
    return puntuacion;
}

function animarCarta(carta, destino, vuelta) {
    return new Promise((resolve) => {
        const destinoElemento = document.getElementById(destino === 'jugador' ? 'cartas_jugador' : 'cartas_dealer');
        const cartaElemento = document.createElement('div');
        cartaElemento.classList.add('carta');
        cartaElemento.innerHTML = `
            <div class="carta-inner">
                <div class="carta-frente"></div>
                <div class="carta-detras" style="background-image: url('${carta.image}');"></div>
            </div>
        `;

        cartaElemento.style.opacity = '0';
        destinoElemento.appendChild(cartaElemento);

        const rect = destinoElemento.getBoundingClientRect();
        const centerX = window.innerWidth / 2 - 200;
        const centerY = window.innerHeight / 2;

        cartaElemento.style.position = 'absolute';
        cartaElemento.style.left = `${centerX}px`;
        cartaElemento.style.top = `${centerY}px`;
        cartaElemento.style.transform = 'translate(-50%, -50%) scale(1.2)';
        cartaElemento.style.transition = 'all 1s ease-in-out';

        setTimeout(() => {
            cartaElemento.style.opacity = '1';
            cartaElemento.style.left = '0';
            cartaElemento.style.top = '0';
            cartaElemento.style.transform = 'scale(1)';
            cartaElemento.style.position = 'relative';
        }, 100);

        if (vuelta) {
            setTimeout(() => {
                cartaElemento.querySelector('.carta-inner').style.transition = 'transform 0.5s';
                cartaElemento.querySelector('.carta-inner').style.transform = 'rotateY(180deg)';
            }, 1000);
        }

        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

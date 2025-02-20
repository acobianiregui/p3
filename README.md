# PRÁCTICA 3 (ANTON COBIAN IREGUI)

## 🔔SOLUCIÓN PRÁCTICA 3 ***(Por favor leer)*** 🔔

<p align="justify"> 
Para esta práctica se ha desarrollado una página web dinámica que permite al usuario jugar partidas de blackjack contra el dealer.<br>
</p>

El enlace a la página es el siguiente: <a href="https://acobianiregui.github.io/p3/p3_sol/">blackjack_simulator </a>

<p align="justify">
En este proyecto se ha hecho uso de dos apis diferentes para la gestión de los elementos dinámicos:
</p>

- <a href=https://deckofcardsapi.com/>api_cartas_póker</a>
- <a href=https://github.com/cheatsnake/emojihub>api_emojis</a>

## 🚨EXTRA🚨

Se ha implementado animaciones de repartir cartas y volteralas para desvelarlas. 

<p align="justify">
Para llevar a acabo estas animaciones y otras funcionalidades sin que se solapen entre si, se han utilizado async functions y las promesas. 
</p>

```js

function funcionPromesa(){
    const miPromesa = new Promise((resolve, reject) => {
    setTimeout(() => {
        let exito; //Controla si la tarea se desarrollo éxito

        //Aqui va el codigo que se quiera ejecutar (por ejemplo mis animaciones)
        if (exito) {
            resolve(); //Tarea cumplida, se puede introducir un mensaje dentro
        } else {
            reject("❌ Hubo un error.");//Tarea falla
        }
    }, 2000);
});
    return miPromesa
}
```
Un ejemplo muy común son los __fetch__. Por ello,para ejecutarlos en una funcion, tenemos dos opciones:

1. Uso de métodos como .then() y .catch

```js
function pillarCarta(){
fetch(`https://deckofcardsapi.com/api/deck/${id_mazo}/draw/?count=1`)
    .then(response => response.json()).then(data => {
      //Hacer lo que se quiera de código
    })
}
```
2. Async functions con el uso de await
```js
async function pillarCarta(destino) {
    if (estado_juego !== 'jugando') return;

    try {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${id_mazo}/draw/?count=1`);
        //Await espera a que se resuelva la promesa
        const data = await response.json();
        //Posteriormente hacer lo que se quiera
        
        //...

    } catch (error) {
        console.error('Error al pedir carta:', error);
    }
}
```



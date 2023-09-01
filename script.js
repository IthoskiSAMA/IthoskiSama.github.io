const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable para almacenar el mensaje del usuario
let context = null;
const API_KEY = "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"; // Pegue su clave API aquí
const inputInitHeight = chatInput.scrollHeight;


const createChatLi = (message, className) => {
    // Cree un elemento de chat <li> con mensaje pasado y className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = (chatElement, userMessage, context) => {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const messageElement = chatElement.querySelector("p");
  // Define las propiedades y el mensaje para la solicitud de API
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: userMessage },
        { role: "system", content: context } // Agrega el contexto como un mensaje de sistema
      ],
    })
  }
    // Envía una solicitud POST a la API, obteniendo una respuesta y configura la respuesta como texto de párrafo
    fetch(API_URL, requestOptions)
      .then(res => res.json())
      .then(data => {
        messageElement.textContent = data.choices[0].message.content.trim();
      })
      .catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "¡Ups! Algo salió mal. Inténtalo de nuevo.";
      })
      .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
  }

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Obtiene el mensaje ingresado por el usuario y elimina los espacios en blanco adicionales
    if(!userMessage) return;

    // Borra el área de texto de entrada y establece su altura por defecto
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Agrega el mensaje del usuario a la ventana de chat
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Mostrar el mensaje "Pensando..." mientras espera la respuesta
        const incomingChatLi = createChatLi("Pensando...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        axios.get('https://www.uteq.edu.ec/comunicacion')
        .then(function (response) {
          const html = response.data;

          // Busca el JSON en el contenido HTML (puede que necesites ajustar esta búsqueda según la estructura del HTML)
          const jsonStartIndex = html.indexOf('<script id="__NEXT_DATA__"');
          const jsonEndIndex = html.indexOf('</script>', jsonStartIndex);
          const jsonScript = html.substring(jsonStartIndex, jsonEndIndex + '</script>'.length);

          const uno = eliminarTextoAntesDePalabra(jsonScript,'{"props"');
          const final = borrarTextoDespuesDePalabra(uno,'</script>');

          // Parsea el contenido como JSON
          const parsedData = JSON.parse(final);

          const jsonData = JSON.stringify(parsedData, null, 2);
          var resultados = [];

          buscarYCombinarObjetos(parsedData, 'ntTitular','ntDescripMeta', resultados);
          context= '"Contexto": "Eres el asistente virtual de la Universidad Tecnica Estatal de Quevedo", "Noticias": {'+ resultados + '}';
        })
        .catch(function (error) {
        console.error('Error:', error);
        });
        generateResponse(incomingChatLi,userMessage, context);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Ajusta la altura del área de texto de entrada en función de su contenido
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

function buscarYCombinarObjetos(objeto, nombreObjetivo1, nombreObjetivo2, resultados) {
  var objeto1 = null;
  var objeto2 = null;

  for (var clave in objeto) {
      if (objeto.hasOwnProperty(clave)) {
          if (clave === nombreObjetivo1) {
              objeto1 = objeto[clave];
              objeto1 = objeto1.replace(/:/g, ",");
          } else if (clave === nombreObjetivo2) {
              objeto2 = objeto[clave];
              objeto2 = objeto2.replace(/\n/g, "");
          } else if (typeof objeto[clave] === 'object') {
              buscarYCombinarObjetos(objeto[clave], nombreObjetivo1, nombreObjetivo2, resultados);
          }
      }
  }

  if (objeto1 !== null && objeto2 !== null) {
      resultados.push('{"Titulo": "'+objeto1 + '", "Descripcion": "' + objeto2 +'"}');
  }
}

function borrarTextoDespuesDePalabra(texto, palabra) {
  // Obtener la posición de la palabra en el texto
  var indice = texto.indexOf(palabra);

  // Si la palabra no se encuentra, no hacer nada
  if (indice === -1) {
    return texto;
  }

  // Extraer el texto antes de la palabra
  var textoSinPalabra = texto.substring(0, indice);

  return textoSinPalabra;
}

function eliminarTextoAntesDePalabra(texto, palabra) {
  // Obtener la posición de la palabra en el texto
  var indice = texto.indexOf(palabra);

  // Si la palabra no se encuentra o es la primera palabra, no hacer nada
  if (indice <= 0) {
    return texto;
  }

  // Extraer el texto después de la palabra
  var textoSinAntes = texto.substring(indice);

  return textoSinAntes;
}
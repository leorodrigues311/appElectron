var chaveAPI = 0 //'06738b02b56b29a661c8' Esta é a chave que criamos dentro do login de cada usuário da loja
var chaveApp = 0 //'ed102c0b-ff23-4826-b296-cfd2c913b133' Esta é a chave de aplicação da Inova
var database = 'inova'
var portDatabase = 5432
var baseUrl = 'https://api.awsli.com.br/v1/produto_estoque' // Essa é a URL de requisição do estoque



const btnSalvaConfig = document.getElementById('saveConfigButton');

function defineChaveAPI() {
   chaveAPI = document.querySelector('#apikey').value
   chaveApp = document.querySelector('#appkey').value
   database = document.querySelector('#databaseInova').value
   portDatabase = document.querySelector('#databasePort').value
}

btnSalvaConfig.addEventListener("click",defineChaveAPI)





export {
    chaveAPI,
    chaveApp,
    database,
    portDatabase,
    baseUrl
}
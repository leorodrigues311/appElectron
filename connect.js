const pg = require ("pg")


var chaveAPI //'06738b02b56b29a661c8' Esta é a chave que criamos dentro do login de cada usuário da loja
var chaveApp //'ed102c0b-ff23-4826-b296-cfd2c913b133' Esta é a chave de aplicação da Inova
var database = 'inova'
var portDatabase = 5432
var baseUrl = 'https://api.awsli.com.br/v1/produto_estoque' // Essa é a URL de requisição do estoque

window.addEventListener("load", recuperaChaveBanco)


async function recuperaChaveBanco () {
    alert("entrou")
    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: portDatabase,
        database: database
        })

    cliente.connect()   
    chaveAPI = await cliente.query("select chaveapi from configlojaintegrada")
    chaveApp = await cliente.query("select chaveapp from configlojaintegrada")
    database = await cliente.query("select banconome from configlojaintegrada")
    portDatabase = await cliente.query("select bancoporta from configlojaintegrada")
    chaveAPI = chaveAPI['rows'][0].chaveapi
    chaveApp = chaveApp['rows'][0].chaveapp
    database = database['rows'][0].banconome
    portDatabase = portDatabase['rows'][0].bancoporta
    document.getElementById("apikey").value = chaveAPI;
    document.getElementById("appkey").value = chaveApp;
    document.getElementById("databaseInova").value = database;
    document.getElementById("databasePort").value = portDatabase;

}


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
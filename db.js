import {chaveAPI} from "./script.js"

const pg = require ("pg")

var api = chaveAPI
var app =  0

 //prametros de conexão com o banco de dados inova passados abaixo

async function connectDb(){
    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: 5432,
        database: "1"

    })

    //armazena o retorno da função query dentro da variável "resultado"


    cliente.connect()
    let r = await cliente.query("select produtoid, produtodescricao, produtocodigobarra, produtoqtdestoque from produtos")
    .then(results => {
        let resultado = results.rows
        resultado = JSON.parse(JSON.stringify(resultado))
        return resultado

    })



    //finaliza a conexão com o banco de dados depois de rodar a query
    .finally(() => cliente.end())
    return r

}


function alteraChaveApp(){
    let APIKey = chaveAPI
    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: 5432,
        database: "1"
        })
    console.log(APIKey)
    cliente.query("update configlojaintegrada set chaveid = 1 chaveapi =",APIKey,", chaveapp =",app )

}
const btnSalvaConfig = document.getElementById('closeModalButton');
btnSalvaConfig.addEventListener("click", alteraChaveApp)


export default connectDb()

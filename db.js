import {chaveAPI, chaveApp} from "./script.js"

const pg = require ("pg")


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
    let APPKey = chaveApp
    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: 5432,
        database: "1"
        })
    console.log(APIKey, APPKey)
    cliente.connect()
    cliente.query("update configlojaintegrada set chaveapi = ",APIKey,", chaveapp =",APPKey,")")

}
const btnSalvaConfig = document.getElementById('closeModalButton');
btnSalvaConfig.addEventListener("click", alteraChaveApp)


export default connectDb()

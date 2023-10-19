import {chaveAPI, chaveApp, database, portDatabase, baseUrl} from "./connect.js"

const pg = require ("pg")


const btnSalvaConfig = document.getElementById('saveConfigButton');
btnSalvaConfig.addEventListener("click", alteraChaveApp)
btnSalvaConfig.addEventListener("click", criaTabela)

window.addEventListener("load", criaTabela)

async function criaTabela() {
    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: portDatabase,
        database: database
        })

    try{
        cliente.connect()
        await cliente.query("CREATE TABLE configlojaintegrada (chaveid integer NOT NULL, chaveapi character varying(255), chaveapp character varying(255), CONSTRAINT configlojaintegrada_pk PRIMARY KEY (chaveid)) WITH (OIDS=FALSE);")
        await cliente.query("INSERT INTO configlojaintegrada(chaveid) VALUES (1);")
        this.alert("Tabela criada com sucesso")

    } catch(e) {
        let r = await cliente.query("select chaveid from configlojaintegrada")
        .then(results => {
            let resultado = results.rows
            resultado = JSON.parse(JSON.stringify(resultado))
            return resultado
        })

            }
}

 //prametros de conexão com o banco de dados inova passados abaixo

async function connectDb(){
    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: portDatabase,
        database: database
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
    let APIkey = chaveAPI
    let APPkey = chaveApp
    let db = database
    let dbPort = portDatabase
    const text = 'update configlojaintegrada set chaveapi = $1, chaveapp =$2'
    const values = [APIkey, APPkey]
    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: portDatabase,
        database: database
        })

    cliente.connect()
    cliente.query(text, values)
    
    .finally(() => cliente.end())
}

export default connectDb()

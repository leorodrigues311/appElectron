import {chaveAPI, chaveApp, database, portDatabase} from "./connect.js"
import {respostaPedidoEspecifico} from "./script.js"

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
        await cliente.query("CREATE TABLE configlojaintegrada (chaveid integer NOT NULL, bancoPorta character varying(255), bancoNome character varying(255), chaveapi character varying(255), chaveapp character varying(255), CONSTRAINT configlojaintegrada_pk PRIMARY KEY (chaveid)) WITH (OIDS=FALSE);")
        await cliente.query("INSERT INTO configlojaintegrada(chaveid) VALUES (1);")

        await cliente.query("CREATE TABLE pedidoslojaintegrada (pedidomovimentoid integer NOT NULL AUTO_INCREMENT, pedidoid integer, datasincronizacao timestamp without time zone, datapedido integer, pedidovalortotal integer, pedidostatus character varying(255), pedidosincronizado boolean, CONSTRAINT pedidoslojaintegrada_pk PRIMARY KEY (pedidomovimentoid)) WITH (OIDS=FALSE);")
        await cliente.query("INSERT INTO pedidoslojaintegrada(pedidomovimentoid) VALUES (1);")
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
    let r = await cliente.query("select produtoid, produtodescricao, produtocodigobarra, produtoqtdestoque, categoriacodigo from produtos left join categorias on categorias.categoriaid = produtos.produtocategoriaid")
    .then(results => {
        let resultado = results.rows
        resultado = JSON.parse(JSON.stringify(resultado))
        return resultado

    })

    //finaliza a conexão com o banco de dados depois de rodar a query
    .finally(() => cliente.end())
    return r

}


export async function consultaPedidos(){

    cliente.connect()
    let ped = await cliente.query("SELECT pedidoid FROM pedidoslojaintegrada")
    return ped

}

export async function armazenaPedidos(respostaPedidoEspecifico){


    let id = respostaPedidoEspecifico.numero
    let valorTotal = respostaPedidoEspecifico['pagamentos'].valor
    let status = respostaPedidoEspecifico['situacao'].nome
    let pedidosincronizado = true
    let data = new Date();
    const text = 'INSERT INTO pedidoslojaintegrada(pedidoid, pedidovalortotal, pedidostatus, pedidosincronizado, datasincronizacao) VALUES ($1, $2, $3, true, $4);'
    const values = [id, valorTotal, status, pedidosincronizado, data]
    cliente.connect()
    cliente.query(text, values)
 
}

export async function alteraEstoque(respostaPedidoEspecifico){

    for (let i = 0; i < respostaPedidoEspecifico['itens'].length; i = i + 1) {

        let estoque = respostaPedidoEspecifico['itens'].length
        const text = 'update produtos set produtoqtdestoque = produtoqtdestoque - $1 where produtocodigobarra = $2'
        const values = [dbPort, db, APIkey, APPkey]
    }
}




function alteraChaveApp(){
    let APIkey = chaveAPI
    let APPkey = chaveApp
    let db = database
    let dbPort = portDatabase
    const text = 'update configlojaintegrada set bancoporta = $1, banconome = $2, chaveapi = $3, chaveapp =$4'
    const values = [dbPort, db, APIkey, APPkey]
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

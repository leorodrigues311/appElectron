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


export async function consultaPedidosBanco(){


    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: portDatabase,
        database: database
        })

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
    await cliente.query(text, values)

 
}

export async function alteraEstoque(respostaPedidoEspecifico, tableProdutosSql, index){

    for (let i = 0; i < respostaPedidoEspecifico['itens'].length; i = i + 1) {


        let prodId = tableProdutosSql[index].produtoid
        const text = 'select produtoqtdestoque where produtocodigobarra = $1'
        const values = [respostaPedidoEspecifico.sku]
        let saldoAnterior = await cliente.query(text, values)
        let entrada = true
        let entradaDescricao = 'Entrada'
        let valorAjustado = respostaPedidoEspecifico['itens'].quantidade
        const text2 = 'select produtoqtdestoque where produtocodigobarra = $1'
        const values2 = [respostaPedidoEspecifico.sku]
        let telaAlteracao = 'frmSincronLojaInt'
        let dataAjuste = new Date();
        

        let estoque = respostaPedidoEspecifico['itens'].quantidade
        let codigoBarra = respostaPedidoEspecifico['itens'].sku
        const text3 = 'update produtos set produtoqtdestoque = produtoqtdestoque - $1 where produtocodigobarra = $2'
        const values3 = [estoque, codigoBarra]

        cliente.connect()
        await cliente.query(text3, values3)


        let estoqueAtual = await cliente.query(text2, values2)


        const text4 = 'INSERT INTO estoquemovimento(estoqmovprodutoid, estoqmovqtdsaldoanterior, estoqmovmovimentoentrada, estoqmovmovimentoentradadescricao, estoqmovqtdajuste, estoqmovqtdsaldoatual, estoqmovtelaalteracao, dataAjuste) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);'
        const values4 = [prodId, saldoAnterior, entrada, entradaDescricao, valorAjustado, estoqueAtual, telaAlteracao, dataAjuste ]

        await cliente.query(text4, values4)

        const text5 = 'INSERT INTO pedidoslojaintegrada(pedidosincronizado) VALUES ($1);'
        const values5 = true

        await cliente.query(text5, values5)
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

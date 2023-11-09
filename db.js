import {recuperaChaveBanco} from "./connect.js"
const path = require('path');

const pg = require ("pg")




var chaveAPI //='06738b02b56b29a661c8'// Esta é a chave que criamos dentro do login de cada usuário da loja
var chaveApp = 'f97286a6-2d79-4327-9cc3-ee690af6a1b8' // Esta é a chave de aplicação da Inova
var database //= 'inova'
var portDatabase //= 5432
var tableProdutosSql





const btnSalvaConfig = document.getElementById('saveConfigButton');
btnSalvaConfig.addEventListener("click", alteraChaveApp)
btnSalvaConfig.addEventListener("click", criaTabela)

window.addEventListener("load", async function () {

    await recuperaTxtConfig()
    criaTabela()
    await alteraChaveApp()
    recuperaChaveBanco()
    tableProdutosSql = await connectDb()

} )



async function recuperaTxtConfig(){

    var txtRes = await fetch(path.join('../../config.txt'))
    .then(res => res.text())
    .then(res=>{res=JSON.parse(res)
        return res
    })

    chaveAPI = txtRes.Chave_API
    database = txtRes.Banco_Nome
    portDatabase = txtRes.Banco_Porta

    console.log(txtRes)

}




async function criaTabela() {
    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: portDatabase,
        database: database
        })
        cliente.connect()

    try{

        await cliente.query("CREATE TABLE configlojaintegrada (chaveid integer NOT NULL, bancoPorta character varying(255), bancoNome character varying(255), chaveapi character varying(255), chaveapp character varying(255), CONSTRAINT configlojaintegrada_pk PRIMARY KEY (chaveid)) WITH (OIDS=FALSE);")
        await cliente.query("INSERT INTO configlojaintegrada(chaveid) VALUES (1);")

        this.alert("Tabela Config. criada com sucesso")

    } catch(e) {
        let r = await cliente.query("select chaveid from configlojaintegrada")
        .then(results => {
            let resultado = results.rows
            resultado = JSON.parse(JSON.stringify(resultado))
            return resultado
        })

    }

    try{

        await cliente.query("CREATE TABLE pedidoslojaintegrada (pedidomovimentoid SERIAL PRIMARY KEY, pedidoid INTEGER, datasincronizacao TIMESTAMP, datapedido VARCHAR(255), pedidovalortotal VARCHAR(255), pedidostatus VARCHAR(255), pedidosincronizado BOOLEAN)");
        alert("Tabela de pedidos criada com sucesso")
    }
    catch(e){
        console.log(e)

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
    console.log("connectDb", r)
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
    let valorTotal = respostaPedidoEspecifico['pagamentos'][0].valor
    let status = respostaPedidoEspecifico['situacao'].nome
    let data = new Date();
    let dataPedido = respostaPedidoEspecifico.data_modificacao

    const text = 'INSERT INTO pedidoslojaintegrada(pedidoid, pedidovalortotal, pedidostatus, datasincronizacao, datapedido) VALUES ($1, $2, $3, $4, $5);'
    const values = [id, valorTotal, status, data, dataPedido]


    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: portDatabase,
        database: database
        })
    cliente.connect()
    await cliente.query(text, values)

 
}

export async function alteraEstoque(respostaPedidoEspecifico, tableProdutosSql, index){


    const Client = require ("pg").Client
    const cliente = new pg.Client({
        user: "postgres",
        password: "inova@613188#",
        host: "127.0.0.1",
        port: portDatabase,
        database: database
        })

        cliente.connect()

    for (let i = 0; i < respostaPedidoEspecifico['itens'].length; i = i + 1) {



        let prodId = tableProdutosSql[index].produtoid
        const text = 'select produtoqtdestoque from produtos where produtocodigobarra = $1'
        const values = [respostaPedidoEspecifico['itens'][i].sku]

        let saldoAnterior = await cliente.query(text, values)
        saldoAnterior = parseInt(saldoAnterior['rows'][0].produtoqtdestoque)
   
        let valorAjustado = parseInt([respostaPedidoEspecifico['itens'][i].quantidade])
        let telaAlteracao = 'frmSincronLojaInt'
        let dataAjuste = new Date();
        let id = respostaPedidoEspecifico.numero

        let entrada
        let entradaDescricao
        let text2

        let text5 = "select pedidoid from pedidoslojaintegrada where pedidoid = $1 and pedidostatus = 'Pedido Efetuado'"
        let values5 = [id]

        let verifyPedidoCancelado = await cliente.query(text5, values5)


        if (respostaPedidoEspecifico['situacao'].id == 8 && verifyPedidoCancelado['rows'][0].pedidoid == id){

            entrada = true
            entradaDescricao = "Entrada"
            text2 = 'update produtos set produtoqtdestoque = (produtoqtdestoque + $1) where produtocodigobarra = $2'
        }

        else if(respostaPedidoEspecifico['situacao'].id == 9){

            entrada = false
            entradaDescricao = "Saida"
            text2 = 'update produtos set produtoqtdestoque = (produtoqtdestoque - $1) where produtocodigobarra = $2'

        }

        

        let estoque = parseInt(respostaPedidoEspecifico['itens'][i].quantidade)
        let codigoBarra = respostaPedidoEspecifico['itens'][i].sku

        const values2 = [estoque, codigoBarra]

        await cliente.query(text2, values2)


        let estoqueAtual = await cliente.query(text, values)
        estoqueAtual = parseInt(estoqueAtual['rows'][0].produtoqtdestoque)
        

        const text3 = 'INSERT INTO estoquemovimento(estoqmovprodutoid, estoqmovqtdsaldoanterior, estoqmovmovimentoentrada, estoqmovmovimentoentradadescricao, estoqmovqtdajuste, estoqmovqtdsaldoatual, estoqmovtelaalteracao, estoqmovdatahora) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);'
        const values3 = [prodId, saldoAnterior, entrada, entradaDescricao, valorAjustado, estoqueAtual, telaAlteracao, dataAjuste ]

        await cliente.query(text3, values3)

        const text4 = 'UPDATE pedidoslojaintegrada set pedidosincronizado = true where pedidoid  = $1;'
        const values4 = [id]

        await cliente.query(text4, values4)
    }
}




async function alteraChaveApp(){
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



export {
    chaveAPI,
    chaveApp,
    database,
    portDatabase, tableProdutosSql}

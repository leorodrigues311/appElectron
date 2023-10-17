
import connectDb from "./db.js" //importando o retorno da função em connectDb.js


var chaveAPI = '06738b02b56b29a661c8'// Esta é a chave que criamos dentro do login de cada usuário da loja
var chaveApp = 'ed102c0b-ff23-4826-b296-cfd2c913b133' // Esta é a chave de aplicação da Inova
var baseUrl = 'https://api.awsli.com.br/v1/produto_estoque' // Essa é a URL de requisição do estoque
var putEstoque = new Array

var tableProdutosSql = await connectDb

const btnEnviaEstoque  = document.getElementById('btnEnviaEstoque');


async function consultaEstoque() {

  let APIKey = chaveAPI
  let appKey = chaveApp
  let url = baseUrl


  var headers = new Headers();
  headers.append("Authorization", "chave_api 06738b02b56b29a661c8 aplicacao f97286a6-2d79-4327-9cc3-ee690af6a1b8");


  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };


  const comparaProdutos = async () => {
    console.log("clicou no botao")
    var resposta = await fetch(url, requestOptions)
      .then(response => response.json())
      .catch(error => console.log('error', error))
    //console.log("esta é a resposta", resposta, "fim da resposta")




    console.log("aqui",tableProdutosSql)


    var inovaBarcodes = new Array
    for (let i = 0; i < tableProdutosSql.length; i = i + 1) {

      inovaBarcodes.push(tableProdutosSql[i].produtocodigobarra)
    }

    //console.log(inovaBarcodes)

    // tratando a resposta da API que foi salva na variavel 'resposta'

    let produtos = new Array// aqui ficam os produtos que são encontrados no banco de dados depois de comparados com a requisição
    let produtosNaoAdicionados = new Array //aqui ficam os produtos que não foram encontrados
    let envioAjusteEstoque = new Array // aqui ficam os produtos prontos para ser enviados pra ajuste da loja integrada

    //console.log("resposta",resposta)


    // este looping compara se os produtos que temos salvo na variável resposta são iguais aos produtos que temos dentro de nosso bando de dados (os produtos do banco de dados estão em tableProdutosSql)
    for (let i = 0; i < resposta['objects'].length; i = i + 1) {

      let verify = resposta['objects'][i].produto.replace('/api/v1/produto/','')
      //console.log("variavel verify",verify)
      //verify = verify.toString()

      var found = inovaBarcodes.includes(verify)
      //console.log("found",found)


      if (found == true) {

        let index = inovaBarcodes.indexOf(verify)
        produtos.push({
          produto: tableProdutosSql[index].produtocodigobarra,
          estoque: tableProdutosSql[index].produtoqtdestoque
        })
        //console.log(produtos)

      }

      else if (found == false) {
        produtosNaoAdicionados.push(resposta['objects'][i].produto)
      }

    }


    // este looping monta o json para ser enviado 
    for (let i = 0; i < produtos.length; i = i + 1) {
      envioAjusteEstoque.push(produtos[i])
    }
    //console.log("envio de ajuste", envioAjusteEstoque)

    //console.log("não adicionados",produtosNaoAdicionados)

    putEstoque = envioAjusteEstoque
    //console.log(putEstoque)

  }

  await comparaProdutos()

}




function enviaEstoque() {

  alert('clicou')
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api 06738b02b56b29a661c8 aplicacao f97286a6-2d79-4327-9cc3-ee690af6a1b8");
  myHeaders.append("Content-Type", "application/json");

  for (let i = 0; i < putEstoque.length; i = i + 1) {


    var envio = new Array


    envio = {
      "gerenciado": true,
      "situacao_em_estoque": null,
      "situacao_sem_estoque": null,
      "quantidade": (parseInt(putEstoque[i].estoque))
    }

    console.log("este é o envio", envio)

    var raw = JSON.stringify(envio)

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    //console.log(requestOptions)

    fetch("https://api.awsli.com.br/v1/produto_estoque/" + putEstoque[i].produto, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));

  }
}


await consultaEstoque()


btnEnviaEstoque.addEventListener("click", enviaEstoque)




/*



{
    "meta": {
        "limit": 20,
        "next": null,
        "offset": 0,
        "previous": null,
        "total_count": 13
    },
    "objects": [
        {
            "aprovado": false,
            "cancelado": false,
            "codigo": "aguardando_pagamento",
            "final": false,
            "id": 2,
            "nome": "Aguardando pagamento",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/2"
        },
        {
            "aprovado": true,
            "cancelado": false,
            "codigo": "em_producao",
            "final": false,
            "id": 17,
            "nome": "Em produção",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/17"
        },
        {
            "aprovado": false,
            "cancelado": true,
            "codigo": "pagamento_devolvido",
            "final": true,
            "id": 7,
            "nome": "Pagamento devolvido",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/7"
        },
        {
            "aprovado": false,
            "cancelado": false,
            "codigo": "pagamento_em_analise",
            "final": false,
            "id": 3,
            "nome": "Pagamento em análise",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/3"
        },
        {
            "aprovado": true,
            "cancelado": false,
            "codigo": "pedido_chargeback",
            "final": true,
            "id": 16,
            "nome": "Pagamento em chargeback",
            "notificar_comprador": false,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/16"
        },
        {
            "aprovado": true,
            "cancelado": false,
            "codigo": "pagamento_em_disputa",
            "final": false,
            "id": 6,
            "nome": "Pagamento em disputa",
            "notificar_comprador": false,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/6"
        },
        {
            "aprovado": false,
            "cancelado": true,
            "codigo": "pedido_cancelado",
            "final": true,
            "id": 8,
            "nome": "Pedido Cancelado",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/8"
        }, 

        {
            "aprovado": true,
            "cancelado": false,
            "codigo": "pedido_em_separacao",
            "final": false,
            "id": 15,
            "nome": "Pedido em separação",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/15"
        },
        {
            "aprovado": true,
            "cancelado": false,
            "codigo": "pedido_entregue",
            "final": true,
            "id": 14,
            "nome": "Pedido Entregue",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/14"
        },
        {
            "aprovado": true,
            "cancelado": false,
            "codigo": "pedido_enviado",
            "final": true,
            "id": 11,
            "nome": "Pedido Enviado",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/11"
        },
        {
            "aprovado": true,
            "cancelado": false,
            "codigo": "pedido_pago",
            "final": false,
            "id": 4,
            "nome": "Pedido Pago",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/4"
        },
        {
            "aprovado": true,
            "cancelado": false,
            "codigo": "pronto_para_retirada",
            "final": true,
            "id": 13,
            "nome": "Pedido pronto para retirada",
            "notificar_comprador": true,
            "padrao": false,
            "resource_uri": "/api/v1/situacao/13"
        }
    ]
}




*/ 


function sincronizador(){

  let url = baseUrl


  var headers = new Headers();
  headers.append("Authorization", "chave_api 06738b02b56b29a661c8 aplicacao f97286a6-2d79-4327-9cc3-ee690af6a1b8");


  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };


  const sincronizaProdutos = async () => {
    var resposta = await fetch(url, requestOptions)
      .then(response => response.json())
      .catch(error => console.log('error', error))

      var tableProdutosSql = await connectDb


  }
}




async function cadastraProduto(){
  

var myHeaders = new Headers();
myHeaders.append("Authorization", "chave_api 06738b02b56b29a661c8 aplicacao f97286a6-2d79-4327-9cc3-ee690af6a1b8");
myHeaders.append("Content-Type", "application/json");



for (let i = 0; i < tableProdutosSql.length; i = i + 1) {

  var produtoEnvio = new Array

  console.log(tableProdutosSql[i].produtodescricao)


  produtoEnvio = {
    "id_externo":null,
    "sku": tableProdutosSql[i].produtocodigobarra,
    "mpn": null,
    "ncm": null,
    "nome": tableProdutosSql[i].produtodescricao,
    "apelido": null,
    "descricao_completa": "<strong>Desctição HTML do produto</strong>",
    "ativo": true,
    "destaque": false,
    "peso": 0.45,
    "altura": 2,
    "largura": 12,
    "profundidade": 6,
    "tipo": "normal",
    "usado": false,
    "removido": false
  }



  var raw = JSON.stringify(produtoEnvio)
    

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  await fetch("https://api.awsli.com.br/v1/produto", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

  }

}

await cadastraProduto()



 
btnEnviaEstoque.addEventListener("click", enviaEstoque)
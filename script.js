import {chaveAPI, chaveApp} from "./db.js" // importando as chaves que estão armazenadas no banco
import {tableProdutosSql, armazenaPedidos, consultaPedidosBanco, alteraEstoque, consultaUltimoPedido} from "./db.js" //importando o retorno da função em connectDb.js
import connectDb from "./db.js"


window.addEventListener("load", function () {


  setInterval(async function(){
    await consultaEstoque(chaveAPI, chaveApp)
    await enviaEstoque(chaveAPI, chaveApp, putEstoque)
    setTimeout(comparaPedidos, 2500 * 60)

  }, 5000 * 60)


})


var putEstoque = new Array
var modalCadastraProduto
var produtosNaoAdicionados = new Array //aqui ficam os produtos que não foram encontrados
var produtos = new Array// aqui ficam os produtos que são encontrados no banco de dados depois de comparados com a requisição
var respostaPedidos = new Array
var respostaPedidoEspecifico = new Array
var indexPedidoEspecifico

// este botão gera a tabela de produtos que são encontrados no inova e no loja integrada, e exibe no modal de envio de estoque 
const btnEnviaEstoque  = document.getElementById('btnEnviaEstoque');
btnEnviaEstoque.addEventListener("click", async() => {
  modalCadastraProduto = false
  //await consultaEstoque(chaveAPI, chaveApp)
  montaTabela(produtos,modalCadastraProduto)
  modalEnvioEstoque.classList.remove('hidden');
  btnCancelaEnvioEstoque.classList.remove('hidden');
  btnConfirmaEnvioEstoque.classList.remove('hidden');
  comparaPedidos(respostaPedidos)
})   

// este botão fica dentro do modal de enviar estoque, ele confirma o envio, alterando o estoque da loja integrada e limpando a tabela que foi gerada no modal
const btnConfirmaEnvioEstoque  = document.getElementById('btnConfirmaEnvioEstoque');
btnConfirmaEnvioEstoque.addEventListener("click", async function(){
  await enviaEstoque(chaveAPI, chaveApp, putEstoque)
  alert("Estoque Enviado com sucesso")
  limpaTabela()
  produtos = new Array
  document.querySelector("#quantidadeEnvioProdutos").innerHTML = ' Itens encontrados para ajustar estoque'
  modalEnvioEstoque.classList.add('hidden')
  btnCancelaEnvioEstoque.classList.add('hidden');
  btnConfirmaEnvioEstoque.classList.add('hidden');

}) 

// este botão fecha o modal de envio de estoque, ele também limpa a tabela
const btnCancelaEnvioEstoque  = document.getElementById('btnCancelaEnvioEstoque');
btnCancelaEnvioEstoque.addEventListener("click", async() => {
  limpaTabela()
  modalEnvioEstoque.classList.add('hidden')
  produtos = new Array
  document.querySelector("#quantidadeEnvioProdutos").innerHTML = ' Itens encontrados para ajustar estoque'
  btnCancelaEnvioEstoque.classList.add('hidden');
  btnConfirmaEnvioEstoque.classList.add('hidden');
})

// este botão confirma o envio do cadastro dos produtos, além disso ele também limpa a tabela que foi gerada
const btnConfirmaCadastroProduto  = document.getElementById('btnConfirmaCadastroProduto');
btnConfirmaCadastroProduto.addEventListener("click", () => {
  cadastraProduto(produtosNaoAdicionados, chaveAPI, chaveApp)
  alert("Produtos Cadastrados com Sucesso")
  limpaTabela()
  produtosNaoAdicionados = new Array
  document.querySelector("#quantidadeEnvioProdutos").innerHTML = ' Itens encontrados para ajustar estoque'
  modalEnvioEstoque.classList.add('hidden')
  btnCancelaCadastroProduto.classList.add('hidden');
  btnConfirmaCadastroProduto.classList.add('hidden');
}) 

// este botão fecha o modal de cadastro de produtos, ele também limpa a tabela
const btnCancelaCadastroProduto  = document.getElementById('btnCancelaCadastroProduto');
btnCancelaCadastroProduto.addEventListener("click", () => {
  limpaTabela()
  modalEnvioEstoque.classList.add('hidden')
  produtos = new Array
  produtosNaoAdicionados = new Array
  document.querySelector("#quantidadeEnvioProdutos").innerHTML = ' Itens encontrados para ajustar estoque'
  btnCancelaCadastroProduto.classList.add('hidden');
  btnConfirmaCadastroProduto.classList.add('hidden');
})

// este botão gera a tabela de cadastro de produtos, exibindo o modal com os produtos que não foram encontrados no loja integrada (busca por SKU)
const btnCadastraProduto = document.getElementById('btnCadastraProduto');
btnCadastraProduto.addEventListener("click", async () => {
  modalCadastraProduto = true
  await consultaEstoque(chaveAPI, chaveApp)
  montaTabela(produtos,modalCadastraProduto)
  modalEnvioEstoque.classList.remove('hidden');
  btnCancelaCadastroProduto.classList.remove('hidden');
  btnConfirmaCadastroProduto.classList.remove('hidden');
})

// esta função faz um get na loja integrada, buscando o estoque de todos os produtos, e logo em seguida chama a "comparaProdutos", que compara os produtos em busca de produtos iguais no inova e no loja integrada
async function consultaEstoque(chaveAPI, chaveApp) {
  await connectDb()

  var headers = new Headers();
  headers.append("Authorization", "chave_api " + chaveAPI + " aplicacao " +  chaveApp);

  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };

  await comparaProdutos(requestOptions, modalCadastraProduto)

}


const comparaProdutos = async (requestOptions, modalCadastraProduto) => {

  var offset = 0
  var totalCount = 0
  var resposta = {"objects": []}
  var count = 0

  modalCarregamento.classList.remove('hidden');

  async function buscaRespostaApi(){


    try{
      let res = await fetch("http://localhost:3336/products?offset="+offset+"", requestOptions)
      .then(response => response.json())
      .catch(error =>  console.log('error', error))

      offset = res['meta'].offset
      totalCount = res['meta'].total_count

      count = count + 20


      for (let i = 0; i < res['objects'].length; i = i + 1) {

        resposta['objects'].push(res['objects'][i])
    
      }
  } catch(e){
    console.log("Não foi possível receber os produtos")
    console.log(e)
  }

  }
  await buscaRespostaApi()


  while(count <= totalCount){

    offset  = offset + 20
    await buscaRespostaApi()

  }
  modalCarregamento.classList.add('hidden');


  let inovaBarcodes = new Array

  for (let i = 0; i < tableProdutosSql.length; i = i + 1) {

    inovaBarcodes.push(tableProdutosSql[i].produtocodigoadicional)

  }

  var lojaIntegradaBarcodes = new Array
  for (let i = 0; i < resposta['objects'].length; i = i + 1) {

    lojaIntegradaBarcodes.push(resposta['objects'][i].sku)

  }

  // tratando a resposta da API que foi salva na variavel 'resposta'


  // este looping compara se os produtos que temos salvo na variável resposta são iguais aos produtos que temos dentro de nosso banco de dados (os produtos do banco de dados estão em tableProdutosSql)
  for (let i = 0; i < resposta['objects'].length; i = i + 1) {

    let verify = resposta['objects'][i].sku
    let found = inovaBarcodes.includes(verify) // essa linha retorna true ou false para a variável found (ele checa se encontrou o produto dentro de inovaBarcodes)

    let index = inovaBarcodes.indexOf(verify) // essa linha traz o indice que foi encontrado o produtos passado em "verfy"
    
    if (found == true) {

      produtos.push({
        codigobarra: tableProdutosSql[index].produtocodigoadicional,
        descricao:tableProdutosSql[index].produtodescricao,
        categoria:tableProdutosSql[index].categoriacodigo,
        estoque: tableProdutosSql[index].produtoqtdestoque,
        idLojaIntegrada: resposta['objects'][i].id
      })

    }

  
  }

  produtosNaoAdicionados = new Array
  
  for (let i = 0; i < inovaBarcodes.length; i = i + 1) {

    let verify = inovaBarcodes[i]
    let found = lojaIntegradaBarcodes.includes(verify) // essa linha retorna true ou false para a variável found (ele checa se encontrou o produto dentro de inovaBarcodes)

    if (found == false) {

      produtosNaoAdicionados.push({
        codigobarra: tableProdutosSql[i].produtocodigoadicional,
        descricao:tableProdutosSql[i].produtodescricao,
        categoria:tableProdutosSql[i].categoriacodigo,
        estoque: tableProdutosSql[i].produtoqtdestoque,
      })

    }
 
  }

  // a variável modalCadastraProduto recebe true ou false quando o botão cadastra produto ou o botão envia estoque são clicados
  if (modalCadastraProduto==false) {
    document.querySelector("#quantidadeEnvioProdutos").innerHTML = produtos.length +  " Itens encontrados para ajustar estoque";
  } 
  else if (modalCadastraProduto==true){
    document.querySelector("#quantidadeEnvioProdutos").innerHTML = produtosNaoAdicionados.length +  " Itens para cadastrar no Loja Integrada";
  }

  // este looping monta o json para ser enviado 
  let envioAjusteEstoque = new Array
  for (let i = 0; i < produtos.length; i = i + 1) {
    envioAjusteEstoque.push(produtos[i])
  }

  putEstoque = envioAjusteEstoque


}

// esta função exclui o html gerado quando abrimos o envia estoque ou o cadastra produtos
async function limpaTabela(){

  let tbody = document.getElementById("tabelaProdutosEnvio");

  while (tbody.hasChildNodes()) {
    tbody.removeChild(tbody.lastChild);
  }

}


// esta função monta a tabela quando clicamos em um dos botões do painel
function montaTabela(produtos, modalCadastraProduto){

  if (Object.keys(produtos).length > 0 && modalCadastraProduto == false){
    for (var indexTable = 0; indexTable < produtos.length; indexTable = indexTable + 1) {
      addRow(produtos, indexTable, produtosNaoAdicionados, modalCadastraProduto)
      
    }
  }
  else if(Object.keys(produtosNaoAdicionados).length > 0 && modalCadastraProduto == true){
    for (var indexTable = 0; indexTable < produtosNaoAdicionados.length; indexTable = indexTable + 1) {
      addRow(produtos, indexTable, produtosNaoAdicionados, modalCadastraProduto)
      
    }
  }

}

// esta função cria as linhas da tabela do modal de envio ou de cadastro de produtos
function addRow(produtos, indexTable, produtosNaoAdicionados, modalCadastraProduto) {

  let table = document.getElementById("tabelaProdutosEnvio");
  let row = table.insertRow(-1);
  let c1 = row.insertCell(0);
  let c2 = row.insertCell(1);
  let c3 = row.insertCell(2);
  let c4 = row.insertCell(3);

  if (indexTable % 2!==0){
    table = table.getElementsByTagName("tr")[indexTable]
    table.setAttribute("class", "border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700"); 
  }
  
  else{
    table = table.getElementsByTagName("tr")[indexTable]
    table.setAttribute("class", "bg-white border-b dark:bg-gray-900 dark:border-gray-700"); 
  }

  if(modalCadastraProduto == false){
    c1.innerText = produtos[indexTable].descricao
    c2.innerText = produtos[indexTable].codigobarra
    c3.innerText = produtos[indexTable].categoria
    c4.innerText = produtos[indexTable].estoque
  }

  else if(modalCadastraProduto == true){
    c1.innerText = produtosNaoAdicionados[indexTable].descricao
    c2.innerText = produtosNaoAdicionados[indexTable].codigobarra
    c3.innerText = produtosNaoAdicionados[indexTable].categoria
    c4.innerText = produtosNaoAdicionados[indexTable].estoque
  }

  c1.setAttribute("class", "px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"); 
  c1.setAttribute("scope","row")
  c2.setAttribute("class", "px-6 py-4"); 
  c3.setAttribute("class", "px-6 py-4");
  c4.setAttribute("class", "px-6 py-4");
}



// esta função envia o estoque que temos no Inova para o loja integrada
async function enviaEstoque(chaveAPI, chaveApp, putEstoque) {
  let date = new Date;
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api " + chaveAPI + " aplicacao " +  chaveApp);
  myHeaders.append("Content-Type", "application/json");

  for (let i = 0; i < putEstoque.length; i = i + 1) {

    var envio = new Array

    envio = {
      "id": putEstoque[i].idLojaIntegrada,
      "gerenciado": true,
      "quantity": (parseInt(putEstoque[i].estoque))
    }


    var raw = JSON.stringify(envio)

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
/*
try{
    fetch("http://localhost:3336/products/estoque", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
} catch(e){

  console.log("Não foi possível alterar o estoque do produto")
}
*/
  }
}


// esta função cadastra os produtos que não foram encontrados no loja Integrada e que são encontrados no Inova (busca por SKU)
async function cadastraProduto(produtosNaoAdicionados, chaveAPI, chaveApp){
  
  await consultaEstoque(chaveAPI, chaveApp)

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api " + chaveAPI + " aplicacao " +  chaveApp);
  myHeaders.append("Content-Type", "application/json");



  for (let i = 0; i < produtosNaoAdicionados.length; i = i + 1) {

    var produtoEnvio = new Array


    produtoEnvio = {
      "id_externo":null,
      "sku": produtosNaoAdicionados[i].codigobarra,
      "mpn": null,
      "ncm": null,
      "nome": produtosNaoAdicionados[i].descricao,
      "apelido": null,
      "descricao_completa": "<strong>Desctição HTML do produto</strong>",
      "ativo": true,
      "destaque": false,
      "peso": null,
      "altura": null,
      "largura": null,
      "profundidade": null,
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

   /* try{
    await fetch("http://localhost:3336/products/", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
    } catch(e){

        console.log("Não foi possível cadastrar produto")
        console.log(e)
    }
*/
    }

}



async function consultaPedidos(chaveAPI, chaveApp){

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api " + chaveAPI + " aplicacao " +  chaveApp);
  console.log(chaveAPI, chaveApp)
  
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  var ultimoPedido = await consultaUltimoPedido()

  console.log(ultimoPedido.pedidoid)

  
  if (ultimoPedido == null){
    ultimoPedido = 1
  }


  var offset = 0
  var totalCount = 0
  respostaPedidos = {"objects": []}
  var count = 0

  async function acumulaPedidos(){


    try{
      /*
    let res = await fetch("http://localhost:3336/orders/search?since_numero="+ultimoPedido.pedidoid+"&offset="+offset, requestOptions)
      .then(res => res.json())
      .catch(error => console.log('error', error));
      */

      let res = {
        "meta": {
          "limit": 15,
          "next": null,
          "offset": 0,
          "previous": null,
          "total_count": 2
        },
        "objects": [
          {
            "cliente": "/api/v1/cliente/34220641",
            "data_criacao": "2022-10-31T12:28:05.704751",
            "data_expiracao": "2022-11-06T12:28:05.782308",
            "data_modificacao": "2022-10-31T12:28:12.653648",
            "id_anymarket": null,
            "id_externo": null,
            "numero": 166,
            "peso_real": "0.450",
            "resource_uri": "/api/v1/pedido/165",
            "situacao": {
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
            "utm_campaign": null,
            "valor_desconto": "0.00",
            "valor_envio": "21.38",
            "valor_subtotal": "11.10",
            "valor_total": "32.48"
          }
        ]
      }

      for (let i = 0; i < res['objects'].length; i = i + 1) {
        respostaPedidos['objects'].push(res['objects'][i])
      }
      
      offset = res['meta'].offset
      totalCount = res['meta'].total_count
      count = (count + 20)


    } catch(e){

      console.log("Não foi possível receber os pedidos")
      console.log(e)
    }

  }

  await acumulaPedidos()

  while(count <= totalCount){
    offset  = offset + 20
    await acumulaPedidos()
  }
  console.log("Resposta Pedidos:",respostaPedidos)

  return respostaPedidos
}


async function comparaPedidos(){
  let date = new Date
  let pedidos = await consultaPedidos(chaveAPI, chaveApp)




  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api " + chaveAPI + " aplicacao " +  chaveApp);





  if (pedidos != undefined){

    for (let i = 0; i < pedidos['objects'].length; i = i + 1) {

      let pedidoNumero = respostaPedidos['objects'][i].numero
      let consultaBanco = await consultaPedidosBanco()
  
  
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
  
      try{/*
          respostaPedidoEspecifico = await fetch("http://localhost:3336/orders/?id="+pedidoNumero+"", requestOptions)
          .then(respostaPedidoEspecifico => respostaPedidoEspecifico.json())
          .catch(error => console.log('error', error));
          */

          respostaPedidoEspecifico = {
            "cliente": {
              "cnpj": null,
              "cpf": "14093771723",
              "data_nascimento": null,
              "email": "teste@lojateste.com.br",
              "id": 34220641,
              "nome": "CLiente Teste",
              "razao_social": null,
              "resource_uri": "/api/v1/cliente/34220641",
              "sexo": "",
              "telefone_celular": "21111111111",
              "telefone_principal": null
            },
            "cliente_obs": null,
            "cupom_desconto": null,
            "data_criacao": "2022-10-31T12:28:05.704751",
            "data_expiracao": "2022-11-06T12:28:05.782308",
            "data_modificacao": "2022-10-31T12:28:12.653648",
            "endereco_entrega": {
              "bairro": "Bonsucesso",
              "cep": "21041040",
              "cidade": "Rio de Janeiro",
              "cnpj": null,
              "complemento": null,
              "cpf": "14093771723",
              "endereco": "Avenida Nova York",
              "estado": "RJ",
              "id": 51870053,
              "ie": "isento",
              "nome": "CLiente Teste",
              "numero": "1",
              "pais": "Brasil",
              "razao_social": null,
              "referencia": null,
              "rg": null,
              "tipo": "PF"
            },
            "envios": [
              {
                "data_criacao": "2022-10-31T12:28:05.722569",
                "data_modificacao": "2022-10-31T12:28:05.722584",
                "forma_envio": {
                  "code": "PAC",
                  "id": 141909,
                  "nome": "Enviali",
                  "tipo": "PAC "
                },
                "id": 69291055,
                "objeto": null,
                "prazo": 7,
                "valor": "21.38"
              }
            ],
            "id_anymarket": null,
            "id_externo": null,
            "itens": [
              {
                "altura": 2,
                "disponibilidade": 0,
                "id": 156487061,
                "largura": 12,
                "linha": 1,
                "nome": "Casaco infantil",
                "pedido": "/api/v1/pedido/165",
                "peso": "0.450",
                "preco_cheio": "12.0000",
                "preco_custo": null,
                "preco_promocional": "11.1000",
                "preco_subtotal": "11.1000",
                "preco_venda": "11.1000",
                "produto": {
                  "id_externo": 88568855,
                  "resource_uri": "/api/v1/produto/88568855?id_externo=1"
                },
                "produto_pai": "/api/v1/produto/182904918",
                "profundidade": 6,
                "quantidade": "1.000",
                "sku": "casaco-azul-tam-m666",
                "tipo": "atributo_opcao"
              }
            ],
            "numero": 170,
            "pagamentos": [
              {
                "authorization_code": null,
                "banco": null,
                "bandeira": "Mastercard",
                "codigo_retorno_gateway": null,
                "forma_pagamento": {
                  "codigo": "pagsegurov2",
                  "configuracoes": {
                    "ativo": true,
                    "disponivel": true
                  },
                  "id": 24,
                  "imagem": "https://cdn.awsli.com.br/production/static/painel/img/formas-de-pagamento/pagsegurov2-logo.png",
                  "nome": "PagSeguro V2",
                  "resource_uri": "/api/v1/pagamento/24"
                },
                "id": 69291176,
                "identificador_id": null,
                "mensagem_gateway": null,
                "pagamento_tipo": "creditCard",
                "parcelamento": {
                  "numero_parcelas": 1,
                  "valor_parcela": 32.48
                },
                "transacao_id": null,
                "valor": "32.48",
                "valor_pago": "32.48"
              }
            ],
            "peso_real": "0.450",
            "resource_uri": "/api/v1/pedido/165",
            "situacao": {
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
            "utm_campaign": null,
            "valor_desconto": "0.00",
            "valor_envio": "21.38",
            "valor_subtotal": "11.10",
            "valor_total": "32.48"
          }
      } catch(e){
          console.log("Não foi possível receber produto específico")
          console.log(e)
      }
  
 
      let inovaBarcodes = new Array
      for (let i = 0; i < tableProdutosSql.length; i = i + 1) {
    
        inovaBarcodes.push(tableProdutosSql[i].produtocodigoadicional)
    
      }

      let pedID =  new Array
      for (let i = 0; i < consultaBanco['rows'].length; i = i + 1) {
    
        pedID.push(consultaBanco['rows'][i].pedidoid)
    
      }

      for (let i = 0; i < respostaPedidoEspecifico['itens'].length; i = i + 1) { 
        console.log(respostaPedidoEspecifico['itens'].length)

        console.log("Protudo", i, " do pedido", respostaPedidoEspecifico.numero )
        console.log(respostaPedidoEspecifico['itens'][i].sku)
        let verify = pedID.includes(respostaPedidoEspecifico.numero)
        let verify2 = inovaBarcodes.includes((respostaPedidoEspecifico['itens'][i].sku.toUpperCase()))
        console.log(verify)
        console.log(verify2)

        indexPedidoEspecifico = inovaBarcodes.indexOf(respostaPedidoEspecifico['itens'][i].sku.toUpperCase())

        console.log(indexPedidoEspecifico)


        const verify3 = pedID.reduce((n, val) => {
          return n + (val === respostaPedidoEspecifico.numero);
        }, 0);


        if (verify == false &&  verify2 == true || verify == true && verify2 == true && respostaPedidoEspecifico['situacao'].id == 8 && verify3 <= 1){
          armazenaPedidos(respostaPedidoEspecifico)
          alteraEstoque(respostaPedidoEspecifico, tableProdutosSql, indexPedidoEspecifico)
        }

      }
    }
  }
}

export {respostaPedidoEspecifico, indexPedidoEspecifico}

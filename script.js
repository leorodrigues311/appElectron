import {chaveAPI, chaveApp} from "./connect.js"
import connectDb, {armazenaPedidos, consultaPedidosBanco} from "./db.js" //importando o retorno da função em connectDb.js




var putEstoque = new Array
var modalCadastraProduto
var tableProdutosSql = await connectDb
var produtosNaoAdicionados = new Array //aqui ficam os produtos que não foram encontrados
var produtos = new Array// aqui ficam os produtos que são encontrados no banco de dados depois de comparados com a requisição
var numeroUltimoPedido
var respostaPedidos = new Array
var respostaPedidoEspecifico = new Array


const btnEnviaEstoque  = document.getElementById('btnEnviaEstoque');
btnEnviaEstoque.addEventListener("click", async() => {
  modalCadastraProduto = false
  await consultaEstoque(chaveAPI, chaveApp)
  montaTabela(produtos,modalCadastraProduto)
  modalEnvioEstoque.classList.remove('hidden');
  btnCancelaEnvioEstoque.classList.remove('hidden');
  btnConfirmaEnvioEstoque.classList.remove('hidden');
  comparaPedidos(respostaPedidos)
})   


const btnConfirmaEnvioEstoque  = document.getElementById('btnConfirmaEnvioEstoque');
btnConfirmaEnvioEstoque.addEventListener("click", () => {
  enviaEstoque(chaveAPI, chaveApp, putEstoque)
  alert("Estoque Enviado com sucesso")
  limpaTabela()
  produtos = new Array
  document.querySelector("#quantidadeEnvioProdutos").innerHTML = ' Itens encontrados para ajustar estoque'
  modalEnvioEstoque.classList.add('hidden')
  btnCancelaEnvioEstoque.classList.add('hidden');
  btnConfirmaEnvioEstoque.classList.add('hidden');

}) 


const btnCancelaEnvioEstoque  = document.getElementById('btnCancelaEnvioEstoque');
btnCancelaEnvioEstoque.addEventListener("click", async() => {

  limpaTabela()
  modalEnvioEstoque.classList.add('hidden')
  produtos = new Array
  document.querySelector("#quantidadeEnvioProdutos").innerHTML = ' Itens encontrados para ajustar estoque'

  btnCancelaEnvioEstoque.classList.add('hidden');
  btnConfirmaEnvioEstoque.classList.add('hidden');

})


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


const btnCadastraProduto = document.getElementById('btnCadastraProduto');
btnCadastraProduto.addEventListener("click", async () => {

  modalCadastraProduto = true
  await consultaEstoque(chaveAPI, chaveApp)
  montaTabela(produtos,modalCadastraProduto)
  modalEnvioEstoque.classList.remove('hidden');
  btnCancelaCadastroProduto.classList.remove('hidden');
  btnConfirmaCadastroProduto.classList.remove('hidden');

})


async function consultaEstoque(chaveAPI, chaveApp) {

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

  var resposta = await fetch("https://api.awsli.com.br/v1/produto", requestOptions)
    .then(response => response.json())
    .catch(error =>  console.log('error', error))

  var inovaBarcodes = new Array
  for (let i = 0; i < tableProdutosSql.length; i = i + 1) {

    inovaBarcodes.push(tableProdutosSql[i].produtocodigobarra)

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

    let index = inovaBarcodes.indexOf(verify)
    
    if (found == true) {

      produtos.push({
        codigobarra: tableProdutosSql[index].produtocodigobarra,
        descricao:tableProdutosSql[index].produtodescricao,
        categoria:tableProdutosSql[index].categoriacodigo,
        estoque: tableProdutosSql[index].produtoqtdestoque,
        idLojaIntegrada: resposta['objects'][i].id
      })

    }

  
  }
  console.log(produtos)
  produtosNaoAdicionados = new Array
  
  for (let i = 0; i < inovaBarcodes.length; i = i + 1) {

    let verify = inovaBarcodes[i]
    let found = lojaIntegradaBarcodes.includes(verify) // essa linha retorna true ou false para a variável found (ele checa se encontrou o produto dentro de inovaBarcodes)

    if (found == false) {

      produtosNaoAdicionados.push({
        codigobarra: tableProdutosSql[i].produtocodigobarra,
        descricao:tableProdutosSql[i].produtodescricao,
        categoria:tableProdutosSql[i].categoriacodigo,
        estoque: tableProdutosSql[i].produtoqtdestoque,
      })

    }
 
  }


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

  console.log(produtosNaoAdicionados)
}


async function limpaTabela(){

  let tbody = document.getElementById("tabelaProdutosEnvio");
  console.log("entrou na function limpa tabela")
  while (tbody.hasChildNodes()) {
    console.log("entrou no while")
    tbody.removeChild(tbody.lastChild);
  }

}



function montaTabela(produtos, modalCadastraProduto){

  if (Object.keys(produtos).length > 0 && modalCadastraProduto == false){
    for (var indexTable = 0; indexTable < produtos.length; indexTable = indexTable + 1) {
      addRow(produtos, indexTable, produtosNaoAdicionados, modalCadastraProduto)
      console.log("entrou")
    }
  }
  else if(Object.keys(produtosNaoAdicionados).length > 0 && modalCadastraProduto == true){
    for (var indexTable = 0; indexTable < produtosNaoAdicionados.length; indexTable = indexTable + 1) {
      addRow(produtos, indexTable, produtosNaoAdicionados, modalCadastraProduto)
      console.log("entrou no outro")
    }
  }

}


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
  } else{
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







function enviaEstoque(chaveAPI, chaveApp, putEstoque) {

  alert('clicou envia estoque')
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api " + chaveAPI + " aplicacao " +  chaveApp);
  myHeaders.append("Content-Type", "application/json");

  for (let i = 0; i < putEstoque.length; i = i + 1) {

    var envio = new Array

    envio = {
      "gerenciado": true,
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

    console.log(putEstoque)

    fetch("https://api.awsli.com.br/v1/produto_estoque/" + putEstoque[i].idLojaIntegrada, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));

  }
}



async function cadastraProduto(produtosNaoAdicionados, chaveAPI, chaveApp){
  
  await consultaEstoque(chaveAPI, chaveApp)

  console.log(chaveAPI, chaveApp)
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api " + chaveAPI + " aplicacao " +  chaveApp);
  myHeaders.append("Content-Type", "application/json");



  for (let i = 0; i < produtosNaoAdicionados.length; i = i + 1) {

    var produtoEnvio = new Array

    console.log(produtosNaoAdicionados[i].descricao)


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



async function consultaPedidos(chaveAPI, chaveApp){



/*
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api " + chaveAPI + " aplicacao " +  chaveApp);
  
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
  
  respostaPedidos = fetch("https://api.awsli.com.br/v1/pedido/search/?since_numero=135&situacao_id=8&pagamento_id=24&limit=15", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

    console.log(respostaPedidos)
*/

return respostaPedidos = {
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
      "data_criacao": "2022-10-31T12:17:51.633657",
      "data_expiracao": "2022-11-06T12:17:51.733114",
      "data_modificacao": "2022-10-31T12:17:58.949670",
      "id_anymarket": null,
      "id_externo": null,
      "numero": 164,
      "peso_real": "0.170",
      "resource_uri": "/api/v1/pedido/164",
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
      "valor_subtotal": "85.00",
      "valor_total": "106.38"
    },
    {
      "cliente": "/api/v1/cliente/34220641",
      "data_criacao": "2022-10-31T12:28:05.704751",
      "data_expiracao": "2022-11-06T12:28:05.782308",
      "data_modificacao": "2022-10-31T12:28:12.653648",
      "id_anymarket": null,
      "id_externo": null,
      "numero": 165,
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
}


async function comparaPedidos(){

  let pedidos = await consultaPedidos(chaveAPI, chaveApp)

  console.log(pedidos)
  for (let i = 0; i < pedidos['objects'].length; i = i + 1) {

    let pedidoNumero = respostaPedidos['objects'][i].numero
    let consultaBanco = await consultaPedidosBanco()

    console.log('numero do pedido:', pedidoNumero)
   /*
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

 
    respostaPedidoEspecifico = fetch("https://api.awsli.com.br/v1/pedido/"+pedidoNumero+"", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
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
          "quantidade": "5.000",
          "sku": 345,
          "tipo": "atributo_opcao"
        }
      ],
      "numero": 165,
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


    console.log(tableProdutosSql[i].produtocodigobarra)

    //let verify = consultaBanco.includes(respostaPedidoEspecifico.numero)
    let verify2 = Object.values(tableProdutosSql).includes(respostaPedidoEspecifico['itens'][i].sku)

    let index = tableProdutosSql.indexOf(respostaPedidoEspecifico.numero)

    if (/*verify == false&& */ verify2 == true)
      armazenaPedidos(respostaPedidoEspecifico)
      alteraEstoque(respostaPedidoEspecifico, tableProdutosSql, index)

 }




}

export {respostaPedidoEspecifico}

import {chaveAPI, chaveApp} from "./connect.js"
import connectDb from "./db.js" //importando o retorno da função em connectDb.js


var putEstoque = new Array
var modalCadastraProduto
var tableProdutosSql = await connectDb
var produtosNaoAdicionados = new Array //aqui ficam os produtos que não foram encontrados
var produtos = new Array// aqui ficam os produtos que são encontrados no banco de dados depois de comparados com a requisição

const btnEnviaEstoque  = document.getElementById('btnEnviaEstoque');
btnEnviaEstoque.addEventListener("click", async() => {
  modalCadastraProduto = false
  await consultaEstoque()
  montaTabela()
  modalEnvioEstoque.classList.remove('hidden');
  btnCancelaCadastroProduto.classList.remove('hidden');
  btnConfirmaCadastroProduto.classList.remove('hidden');
})   

const btnConfirmaEnvioEstoque  = document.getElementById('btnConfirmaEnvioEstoque');
btnConfirmaEnvioEstoque.addEventListener("click", () => {
  enviaEstoque()
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
  cadastraProduto()
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
  await consultaEstoque()
  montaTabela()
  modalEnvioEstoque.classList.remove('hidden');
  btnCancelaEnvioEstoque.classList.remove('hidden');
  btnConfirmaEnvioEstoque.classList.remove('hidden');

})


async function consultaEstoque() {

  var headers = new Headers();
  headers.append("Authorization", "chave_api 06738b02b56b29a661c8 aplicacao f97286a6-2d79-4327-9cc3-ee690af6a1b8");

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

  // tratando a resposta da API que foi salva na variavel 'resposta'


  // este looping compara se os produtos que temos salvo na variável resposta são iguais aos produtos que temos dentro de nosso banco de dados (os produtos do banco de dados estão em tableProdutosSql)
  for (let i = 0; i < resposta['objects'].length; i = i + 1) {

    let verify = resposta['objects'][i].sku
    var found = inovaBarcodes.includes(verify) // essa linha retorna true ou false para a variável found (ele checa se encontrou o produto dentro de inovaBarcodes)

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

    else if (found == false) {
      produtosNaoAdicionados.push({
        codigobarra: tableProdutosSql[index].produtocodigobarra,
        descricao:tableProdutosSql[index].produtodescricao,
        categoria:tableProdutosSql[index].categoriacodigo,
        estoque: tableProdutosSql[index].produtoqtdestoque,
        
      })
    }

  }
  console.log(modalCadastraProduto)
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



async function limpaTabela(){

  let tbody = document.getElementById("tabelaProdutosEnvio");
  console.log("entrou na function limpa tabela")
  while (tbody.hasChildNodes()) {
    console.log("entrou no while")
    tbody.removeChild(tbody.lastChild);
  }

}



function montaTabela(){

  for (var indexTable = 0; indexTable < produtos.length; indexTable = indexTable + 1) {
     addRow(produtos, indexTable)
  }

}


function addRow(produtos, indexTable) {
      
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

  c1.innerText = produtos[indexTable].descricao
  c1.setAttribute("class", "px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"); 
  c1.setAttribute("scope","row")

  
  c2.innerText = produtos[indexTable].codigobarra
  c2.setAttribute("class", "px-6 py-4"); 


  c3.innerText = produtos[indexTable].categoria
  c3.setAttribute("class", "px-6 py-4");


  c4.innerText = produtos[indexTable].estoque
  c4.setAttribute("class", "px-6 py-4");

}







function enviaEstoque() {

  alert('clicou envia estoque')
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api 06738b02b56b29a661c8 aplicacao f97286a6-2d79-4327-9cc3-ee690af6a1b8");
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



async function cadastraProduto(){
  
  consultaEstoque()

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "chave_api 06738b02b56b29a661c8 aplicacao f97286a6-2d79-4327-9cc3-ee690af6a1b8");
  myHeaders.append("Content-Type", "application/json");



  for (let i = 0; i < produtosNaoAdicionados.length; i = i + 1) {

    var produtoEnvio = new Array

    console.log(produtosNaoAdicionados[i].produtodescricao)


    produtoEnvio = {
      "id_externo":null,
      "sku": produtosNaoAdicionados[i].produtocodigobarra,
      "mpn": null,
      "ncm": null,
      "nome": produtosNaoAdicionados[i].produtodescricao,
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



//await cadastraProduto()


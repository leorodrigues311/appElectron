

var password = "inova@123"
const openModalButton = document.getElementById('openModalButton');
const closeModalButton = document.getElementById('closeModalButton');
const savePassword = document.getElementById('savePassword');
const closePassword = document.getElementById('closePassword');
const modal = document.getElementById('modal');

openModalButton.addEventListener('click', () => {
  modalSenha.classList.remove('hidden');
  document.getElementById("password").focus()
});

const btnCancelaEnvioEstoque  = document.getElementById('btnCancelaEnvioEstoque');
btnCancelaEnvioEstoque.addEventListener("click", () => {
  
  modalEnvioEstoque.classList.add('hidden')

  let tbody = document.getElementById("tabelaProdutosEnvio");
  while (tbody.hasChildNodes()) {
    tbody.removeChild(tbody.lastChild);
  }

});




function verificaSenha(){

  var senhaDigitada = document.querySelector("#password").value
  if(password == senhaDigitada) {

    modalSenha.classList.add('hidden');
    modal.classList.remove('hidden');
    document.querySelector("#password").value = null
  }

  else{
    alert("Senha incorreta")
    document.querySelector("#password").value = null
  }

}

savePassword.addEventListener('click', () => {
  verificaSenha()
});

closePassword.addEventListener('click', () => {
  modalSenha.classList.add('hidden');
  document.querySelector("#password").value = null
});
closeModalButton.addEventListener('click', () => {
  modal.classList.add('hidden');
});

saveConfigButton.addEventListener('click', () => {
  modal.classList.add('hidden');
});

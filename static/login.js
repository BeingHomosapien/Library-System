
window.onload = function(){

    var button = document.querySelector('#submit');
    var input1 = document.querySelector('#input1');
    var input2 = document.querySelector('#input2');
  
    button.disabled = true;
    $('body').keyup(function(){
      if(input1.value.length != 0 && input2.value.length !=0 ){
        button.disabled = false;
      }
      else{
        button.disabled = true;
      }
    })

}
    
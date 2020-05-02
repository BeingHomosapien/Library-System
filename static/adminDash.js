window.onload = function(){

    var button = document.querySelector('#submit');
    var input1 = document.querySelector('#input1');
    var input2 = document.querySelector('#input2');
    var input3 = document.querySelector('#input3')
    button.disabled = true;
    $('body').keyup(function(){
      if(input1.value.length != 0 && input2.value.length !=0 && input3.value.length!=0 ){
        button.disabled = false;
      }
      else{
        button.disabled = true;
      }
    })
    try{
      setTimeout(function(){
        $('.hidden').fadeOut('slow');
      }, 2000);
    }
    catch(Exception){

    }
}
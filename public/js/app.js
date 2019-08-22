'use strict';
console.log('alive');
$('.select').on('click',function(){
  console.log('button click');
  $(this).next().slideToggle();
});


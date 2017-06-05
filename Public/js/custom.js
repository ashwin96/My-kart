$(function(){
   Stripe.setPublishableKey('pk_test_Sy0sIkEvUvUC5MpDMEoZiURV');
  $('#search').keyup(function () {
      var search_term = $(this).val();
      $.ajax({
        method:'POST',
        url:'/api/search',
        data:{
          search_term
        },
        dataType:'json',
        success:function (json) {
          var data = json.hits.hits.map(function (hit) {
            return hit;
          });
          console.log(data);
        },
        error:function (error) {
            console.log(err);
        }
      });
  })

$(document).on('click','#plus',function (e) {
    e.preventDefault();
    var price  = parseFloat($('#price').val());
    var quantity = parseFloat($('#quantity').val());
    price += parseFloat($('#priceHidden').val());
    quantity +=1;
    $('#quantity').val(quantity);
    $('#price').val(price.toFixed(2));
    $('#total').html(quantity);
});
$(document).on('click','#minus',function (e) {
    e.preventDefault();
    var price  = parseFloat($('#price').val());
    var quantity = parseFloat($('#quantity').val());
    if(quantity==1){
      price = $('#priceHidden').val();
      quantity=1;
    }
    else{
    price -= parseFloat($('#priceHidden').val());
    quantity -=1;
    }
    $('#quantity').val(quantity);
    $('#price').val(price.toFixed(2));
    $('#total').html(quantity);
});

function stripeResponseHandler(status, response) {

  var $form = $('#payment-form');

  if (response.error) { // Problem!

    // Show the errors on the form:
  //  $form.find('.payment-errors').text(response.error.message);
  //  $('#submit').prop('disabled', false); // Re-enable submission

    $form.find('.payment-errors').text(response.error.message);
    $form.find('button').prop('disabled', false);
  } else { // Token was created!

    // Get the token ID:
    //response contains id and card, which contains additional card details
    var token = response.id;

    // Insert the token ID into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken"/>').val(token));

    // Submit the form:
    $form.get(0).submit();

  }
};

  $('#payment-form').submit(function(event) {

    // Grab the form:
    var $form = $(this);

    // Disable the submit button to prevent repeated clicks:
    //$('#submit').prop('disabled', true);

    // Request a token from Stripe:
    //clicks
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from being submitted:
    //submitting with the default action
    return false;
  });


})

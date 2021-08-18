$(".form-box #create-title").click(function () {
    $("#create-toggle").toggleClass("show-inline-block");
    $("#create-title").children(".icon").toggleClass("fas fa-plus-square");
    $("#create-title").children(".icon").toggleClass("far fa-minus-square");
});

$("input[type='checkbox']").checkboxradio();
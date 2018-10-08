$(document).ready(function(){
    $('.delete-article').on('click', function(){
        let id = $(this).attr('data-id');
        let choice = confirm('Do you really want to delete the article ? ');
        if(choice){
            $.ajax({
                type: 'Delete',
                url: `/articles/${id}`,
                success: function(res){
                    window.location.href="/";
                },
                error: function(err){
                    console.log(err);
                }
            });
           
        } else{
            return;
        }
       
       
    });
});
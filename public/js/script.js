let lastUpdatedElm = document.querySelector(".updatedLast");

jQuery(document).ready(function() {
    //document.querySelector(".updatedLast").setAttribute("datetime", new Date().toISOString());
    jQuery("time.timeago").timeago();
});

setInterval(function() {
    let lastUpdatedElmHtml = lastUpdatedElm.innerHTML;
    let lastUpdatedElmMin = lastUpdatedElmHtml.replace(/[^0-9]/g, '');
    if(lastUpdatedElmMin > 5) {
        location.reload();
    }
}, 30000);
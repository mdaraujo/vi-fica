function checkLocalStorage(elements) {
    elements.each(function () {
        let element_id = $(this).prop('id');
        if (element_id in localStorage) {
            $('#' + element_id + '[type!=\'checkbox\']').val(localStorage[element_id]).trigger('change');
            $('#' + element_id + '[type=\'checkbox\']').each(function () {
                if ('' + $(this).prop("checked") !== localStorage[element_id]) {
                    $(this).prop("checked", localStorage[element_id]).trigger('change');
                }
            });
        }
    });
}

$(document).ready(function () {
    $('input[type!=\'checkbox\'], select').on("focusout change", function () {
        if ($(this).val() !== null)
            localStorage[$(this).attr('id')] = $(this).val();
    });

    $('input[type=\'checkbox\']').on("focusout change", function () {
        if ($(this).val() !== null)
            localStorage[$(this).attr('id')] = $(this).prop('checked');
    });

    $('#range_toggle').on("change", function (event) {
        if ($(this).prop('checked') !== $("#end").is(":visible")) {
            $("#end").animate({ width: "toggle" });
            if (!event.isTrigger) update_graphs();
        }
    });

    $('#start').on("change", function (event) {
        if ($('#range_toggle').prop('checked') && $(this).val() > $('#end').val()){
            $(this).datepicker("setDate", $('#end').val());
        }
    });

    $('#end').on("change", function (event) {
        if ($(this).val() < $('#start').val()) {
            $(this).datepicker("setDate", $('#start').val());
        }
    });

    $('#type').on("change", function (event) {
        let courses = $("#courses");
        if ($(this).find(':selected').length > 0 && $(this).find(':selected').data('courses').length > 0) {
            courses.find('option').remove();
            $(this).find(':selected').data('courses').split(';').forEach(function (entry) {
                courses.append($("<option></option>").text(entry).attr("value", entry));
            });
            checkLocalStorage(courses);
            if ($("#courses:visible").length === 0) {
                $('label[for="courses"]').show();
                courses.animate({ width: "toggle" });
            }
            courses.trigger('change');
        } else {
            if ($("#courses:visible").length > 0) {
                courses.animate({ width: "toggle" }, 500, function () {
                    $('label[for="courses"]').hide();
                });
            }
        }
        if (!event.isTrigger) update_graphs();
    });

    $('#courses').on("change", function (event) {
        if (!event.isTrigger) update_graphs();
    });

    $.fn.datepicker.dates['pt'] = {
        days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
        daysMin: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
        months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        today: "Hoje",
        weekStart: 1,
    };

    let current = new Date();
    let date_pickers = $('.date-picker');
    date_pickers.val(current.getFullYear() + '-' + lpad(current.getMonth() + 1, 0, 2));
    checkLocalStorage(date_pickers);

    date_pickers.datepicker({
        format: 'yyyy-mm', autoclose: true, orientation: "top",
        language: "pt", startView: "years", minViewMode: "months"
    }).on("changeDate", function (e) {
        update_graphs();
    });

    d3.csv("../config/indicators.csv", function (error, data) {
        if (!error) {
            data.forEach(function (entry) {
                $("#accordion").append( '<div class="card">' +
                    '<div class="card-header" id="heading_' + entry.name + '">' +
                    '<button style="color:' + entry.color + '" class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapse_' + entry.name + '" aria-expanded="false" aria-controls="collapseThree">' +
                    '<i class="fas fa-hand-pointer mr-2"></i>' + entry.name +
                    '</button>' +
                    '</div>' +
                    '<div id="collapse_' + entry.name + '" class="collapse" aria-labelledby="heading_' + entry.name + '" data-parent="#accordion">' +
                    '<div class="card-body"> ' + entry.description + ' </div>' +
                    '</div>' +
                    '</div>' );
                $("#caption").append(   '<li class="list-group-item" style="color:' + entry.color + '" title="' + entry.description + '">' +
                    '<i class="fas fa-circle mr-2"></i>' + entry.name +
                    '</li>');
            });
        }
    });

    d3.csv("../config/courses.csv", function (error, data) {
        if (error) return;
        data.forEach(function (entry) {
            $("#type").append($("<option></option>").text(entry.name)
                .attr("value", entry.path).attr("data-courses", entry.values));
        });
        checkLocalStorage($('#type'));
        checkLocalStorage($('input[type="checkbox"]'));
        update_graphs();
    });
});
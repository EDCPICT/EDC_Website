// Adsense count and lazy async ad loading
function load_adsense_ads() {
    for (i = 0; i < adsense_ads_count; i++) {
        loadOneAd();
    }
}

function loadOneAd() {
    (adsbygoogle = window.adsbygoogle || []).push({});
}

function add_new_ad(parentElementId) {
    var adMock = $("#ad_mock").clone();
    adMock.attr("id", "");
    adMock.attr("class", "adsbygoogle");

    $("#" + parentElementId).append(adMock);
}

function actualizar_campos(campo, ancho_original, alto_original) {
    var array_id = campo.id.split("_");

    if (array_id[0] == "pixeles") {
        if (array_id[1] == "ancho") {
            $("#porcentaje_ancho").val(
                Math.round(($("#pixeles_ancho").val() / ancho_original) * 100)
            );
        } else {
            $("#porcentaje_alto").val(
                Math.round(($("#pixeles_alto").val() / alto_original) * 100)
            );
        }
    } else {
        if (array_id[1] == "ancho") {
            $("#pixeles_ancho").val(
                Math.round((ancho_original * $("#porcentaje_ancho").val()) / 100)
            );
        } else {
            $("#pixeles_alto").val(
                Math.round((alto_original * $("#porcentaje_alto").val()) / 100)
            );
        }
    }
    if ($("#mantener_proporcion").prop("checked")) {
        if (array_id[1] == "ancho") {
            $("#pixeles_alto").val(
                Math.round(alto_original * ($("#pixeles_ancho").val() / ancho_original))
            );
            $("#porcentaje_alto").val(Math.round($("#porcentaje_ancho").val()));
        } else {
            $("#pixeles_ancho").val(
                Math.round(ancho_original * ($("#pixeles_alto").val() / alto_original))
            );
            $("#porcentaje_ancho").val(Math.round($("#porcentaje_alto").val()));
        }
    }
    estimateSize();
}

function selectBackground(element, color) {
    $("#background_color_field").val(color);
    $("#sector_background div").removeClass("selected");
    element.addClass("selected");
}

// jQuery for background slider
function moveHeaderBackground() {
    $(".intro").css("transition", "all 1000s");
    $(".intro").css("background-position", "-15000px 0");
}

//setTimeout("moveHeaderBackground()", 3500);

// fixed nav bar on scroll
var offset = $("#main-nav").offset();
$(window).scroll(function () {
    //$('#mine').text($(document).scrollTop());
    $("#main-nav").addClass("fixed-nav");
    if ($(document).scrollTop() < 30) {
        $("#main-nav").removeClass("fixed-nav");
    }
});

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $("a.page-scroll").bind("click", function (event) {
        var $anchor = $(this);
        $("html, body")
            .stop()
            .animate(
                {
                    scrollTop: $($anchor.attr("href")).offset().top,
                },
                1500,
                "easeInOutExpo"
            );
        event.preventDefault();
    });
});

// Closes the Responsive Menu on Menu Item Click
$(".navbar-collapse ul li a").click(function () {
    if (
        $(this).attr("class") != "dropdown-toggle active" &&
        $(this).attr("class") != "dropdown-toggle"
    ) {
        $(".navbar-toggle:visible").click();
    }
});

// jQuery for retina
var pixelRatio = !!window.devicePixelRatio ? window.devicePixelRatio : 1;
$(window).on("load", function () {
    if (pixelRatio > 1) {
        $("img.replace2x").each(function () {
            $(this).attr("src", $(this).attr("src").replace(".", "@2x."));
        });
    }
});

// jQuery for online droparea
var processAsSoonAsPossible = false;
if (typeof pro === "undefined") {
    var pro = false;
}

// Adsense count and lazy async ad loading
$(window).on("load", function () {
    load_adsense_ads();

    if ($("#selector_extension")[0] != undefined) {
        onFormatChanged();
    }

    initializeSwiper(homeInfoSwiperOptions);
    initializeSwiper(plansSwiperOptions);
});

function incrementImageCounter() {
    jQuery.get("increment.php");
}

jQuery(function ($) {
    $('#eye-password').mousedown(function (e) {
        return revealPassword(true);
    });
    $('#eye-password').mouseup(function (e) {
        return revealPassword(false);
    });
    $('#eye-password').mouseout(function (e) {
        return revealPassword(false);
    });

});


function revealPassword(shouldReveal) {
    const PASSWORD = "password";
    const TEXT = "text";

    const passwordField = document.querySelector("#form_pwd_field");

    return shouldReveal
        ? (passwordField.type = TEXT)
        : (passwordField.type = PASSWORD);
}

function enableButton(element, enabledStyleClass, disabledStyleClass) {
    element.removeAttribute('disabled');
    element.classList.remove(disabledStyleClass);
    element.classList.add(enabledStyleClass);
};

function disableButton(element, enabledStyleClass, disabledStyleClass) {
    element.setAttribute('disabled', 'true');
    element.classList.remove(enabledStyleClass);
    element.classList.add(disabledStyleClass);
};

function validateContactForm(formName, fields) {
    const SUBMIT_BUTTON_ID = 'contact-submit';
    const ENABLED_BUTTON_CLASS = 'contact-cta-enabled';
    const DISABLED_BUTTON_CLASS = 'contact-cta-disabled';

    const submitButton = document.getElementById(SUBMIT_BUTTON_ID);
    const validation = fields.filter(function (field) {
        const formInput = document.forms[formName][field];
        return formInput.value != '';
    })

    return validation.length === fields.length ? enableButton(submitButton, ENABLED_BUTTON_CLASS, DISABLED_BUTTON_CLASS) : disableButton(submitButton, ENABLED_BUTTON_CLASS, DISABLED_BUTTON_CLASS);
}

function hideContactFormCtaMessage() {
    var ctaMessage = $(".cta-message");
    if (ctaMessage.length > 0) {
        ctaMessage.hide();
    }
}

function toggleNavbarDisplay() {
    var navbarElement = document.getElementsByClassName("navbar")[0];

    if (window.innerWidth >= 992) {
        navbarElement.style.display = "none";
    } else {
        navbarElement.style.display = "flex";
    }
}

function runToggleNavbarDisplayListener() {
    toggleNavbarDisplay();
    window.addEventListener("resize", toggleNavbarDisplay);
}

function switchSurveyOption(option) {
    var element = $('#' + option);
    element.toggleClass('selected');
}

function toggleSurveyPopup() {
    var popup = $('.survey-popup');
    popup.toggleClass('open');
}

function submitSurvey() {
    var selectedOptions = $('.survey-popup .option.selected');
    var selectedIds = [];
    selectedOptions.each(function (index) {
        var id = $(this).attr('id');
        selectedIds.push(id);
    })
    //console.log(selectedIds);

    if (selectedIds.length == 0) {
        $('.survey-popup .empty_error').show();
        return;
    } else {
        $('.survey-popup .empty_error').hide();
    }

    $.ajax({
        type: "POST",
        url: '/survey_processor.php',
        data: {'responses': selectedIds},
    });
    removeSurveyPopup();
}

function removeSurveyPopup() {
    var popup = $('.survey-popup');
    popup.remove();
}

function navigateToPayment(planSelected) {
    window.location.replace(`/payment.php?selected_plan=${planSelected}`);
}

var homeInfoSwiperOptions = {
    container: ".home-info-swiper-container",
    swiperOptions: {
        breakpointDesktop: 1185,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    },
    onInit: {
        addClasses: addHomeInfoSwiperClassesOnInit
    },
    onClean: {
        removeClasses: removeHomeInfoSwiperClassesOnClean
    }
}

function addHomeInfoSwiperClassesOnInit() {
    $("#how-it-works .container-fluid").removeClass("home-info-desktop-swiper-reset");
    $("#how-it-works .swiper-wrapper").addClass("home-info-swiper-height");
    $("#how-it-works .swiper-pagination").show();
}

function removeHomeInfoSwiperClassesOnClean() {
    $("#how-it-works .container-fluid").addClass("home-info-desktop-swiper-reset");
    $("#how-it-works .swiper-wrapper").removeClass("home-info-swiper-height");
    $("#how-it-works .swiper-pagination").hide();
}

var plansSwiperOptions = {
    container: ".plans-swiper-container",
    swiperOptions: {
        slidesPerView: 3.6,
        slidesPerViewDesktop: 3.6,
        slidesPerViewTablet: 2.6,
        slidesPerViewMobile: 1.6,
        breakpointDesktop: 1400,
        breakpointTablet: 1050,
        breakpointMobile: 700,
        slidesOffsetBefore: 25,
        freeMode: true,
        freeModeMomentumRatio: 0.4,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        }
    },
    onInit: {
        addClasses: addPlansClassesOnInit
    },
    onClean: {
        removeClasses: removePlansClassesOnClean
    }
}

function addPlansClassesOnInit() {
    $("#plans-swiper").removeClass("plans-desktop-swiper-reset");
    $("#plans-swiper .swiper-pagination").show();
}

function removePlansClassesOnClean() {
    $("#plans-swiper").addClass("plans-desktop-swiper-reset");
    $("#plans-swiper .swiper-pagination").hide();
}

function initializeSwiper(options) {
    var screenWidth = $(window).width();

    if (options.swiperOptions.slidesPerView != undefined) {
        if (screenWidth < options.swiperOptions.breakpointMobile) {
            options.swiperOptions.slidesPerView = options.swiperOptions.slidesPerViewMobile;
        } else if (screenWidth < options.swiperOptions.breakpointTablet) {
            options.swiperOptions.slidesPerView = options.swiperOptions.slidesPerViewTablet;
        } else {
            options.swiperOptions.slidesPerView = options.swiperOptions.slidesPerViewDesktop;
        }
    }

    var needsToInitializeSwiper = screenWidth <= options.swiperOptions.breakpointDesktop && (options.swiper == undefined || Math.abs(options.lastInitializedWidth - screenWidth) > 50);

    if (needsToInitializeSwiper) {
        options.lastInitializedWidth = screenWidth;

        if (options.onInit != undefined && options.onInit.addClasses != undefined) {
            options.onInit.addClasses()
        }

        if (options.swiper != undefined) {
            options.swiper.destroy();
        }

        options.swiper = new Swiper(options.container, options.swiperOptions);

    } else if (screenWidth > options.swiperOptions.breakpointDesktop && options.swiper != undefined) {
        options.swiper.destroy();
        options.swiper = undefined;

        if (options.onClean != undefined && options.onClean.removeClasses != undefined) {
            options.onClean.removeClasses()
        }

        $(options.container + " .swiper-wrapper").removeAttr("style");
        $(options.container + " .swiper-slide").removeAttr("style");
    }
}

$(window).on("resize", function () {
    initializeSwiper(homeInfoSwiperOptions);
    initializeSwiper(plansSwiperOptions);
});


function openHamburgerNav() {
    document.getElementById("menu-overlay").style.display = "flex";
    document.body.style.overflowY = "hidden";
    $('.main-container').hide();
}

function closeHamburgerNav() {
    document.getElementById("menu-overlay").style.display = "none";
    document.body.style.overflowY = "visible";
    $('.main-container').show();
}

function closeHamburgerNavOnResize() {
    if (window.innerWidth >= 992) {
        closeHamburgerNav();
    }
}

window.addEventListener("resize", closeHamburgerNavOnResize);

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    //ga("send","event","app install process", "beforeinstallprompt event");
    //showAppInstallBanner();
});

function showAppInstallBanner() {
    $('#app-install-banner').show();
    //deferredPrompt.prompt();

    ga("send", "event", "app install process", "showing bottom sheet");

    $('#app-install-banner #install-button').on('click', (e) => {
        ga("send", "event", "app install process", "clicked install button");
        // hide our user interface that shows our A2HS button
        $('#app-install-banner').hide();
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice
            .then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    ga("send", "event", "app install process", "user accepted");
                } else {
                    ga("send", "event", "app install process", "user dismissed");
                }
                deferredPrompt = null;
            });
    });

    $('#app-install-banner .close-button').on('click', (e) => {
        ga("send", "event", "app install process", "dismissed bottom sheet");
        $('#app-install-banner').hide();
    });
}

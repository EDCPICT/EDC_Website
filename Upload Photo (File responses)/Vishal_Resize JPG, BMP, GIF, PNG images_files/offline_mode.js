var uploaded_images = [];
var image_id_count = 1;
var addedDownloadAreaAd = false;
var showResizeResults = false;
var startTimestampOfJobsExecution = 0;
var zipJob = new ZipJob();
let canvaWidth = 900;
let canvaHeight = 500;
let isCanvasEnabled = false;

var TOGGLE_ELEMENT_SENTENCE_METHODS = {
    VALUE: "value",
    INNER_HTML: "innerHtml"
}
///////////////
// UPLOADING //
///////////////

//offline dropzone setup
function setup_offline_form() {

    let dropzone = $('#dropzone-container-offline');
    let droppedFiles = false;

    dropzone.on('drag drop dragenter dragleave dragend dragover dragstart', function (e) {
        e.stopPropagation();
        e.preventDefault();
    }).on('click', function () {
        ga("send", "event", "Clicked to upload image");
        $('#offline-file-field').click();
    }).on('dragenter dragover', function () {
        dropzone.addClass('is-dragging-over');
    })
        .on('drop dragleave dragend', function () {
            dropzone.removeClass('is-dragging-over');
        })
        .on('drop', function (e) {
            ga("send", "event", "Dropped a file");
            droppedFiles = e.originalEvent.dataTransfer.files;
            getDroppedImagesFromFiles(droppedFiles);
        });
    if (document.getElementById("offline-file-field")) {
        document.getElementById("offline-file-field").addEventListener("change", onImageUpload, false);
    }

    $('#tool_select_sizing').on('click', (function (e) {
        e.preventDefault();
        $(this).parent().find('a').removeClass('selected')
        $(this).addClass('selected');

        $('.tool-selected').find('div').removeClass('show')
        $('#tool_selected_sizing').addClass('show');

        isCanvasEnabled = false;
    }));

    $('#tool_select_photo_editor').on('click', (function (e) {
        e.preventDefault();
        $(this).parent().find('a').removeClass('selected')
        $(this).addClass('selected');

        $('.tool-selected').find('div').removeClass('show')
        $('#tool_selected_photo_editor').addClass('show');

        zoomImage();

        isCanvasEnabled = true;
    }));
}

setup_offline_form();

//Zoom Image
function zoomImage() {

    $('#photo_editor_canvas').attr({height: canvaHeight, width: canvaWidth})

    $("#zoom_value").text("100%")
    $("#zoom_out").click(function (e) {
        e.preventDefault();
        let value = $("#zoom_value").text();
        value = parseInt(value);
        value--;
        if (value >= 0) {
            $("#zoom_value").text(value + "%")
        }
    });
    $("#zoom_in").click(function (e) {
        e.preventDefault();
        let value = $("#zoom_value").text();
        value = parseInt(value);
        value++;
        if (value <= 100) {
            $("#zoom_value").text(value + "%")
        }
    });

}

function fillCanvas(img) {
    let canvas = document.getElementById('photo_editor_canvas');
    let ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);       // DRAW THE IMAGE TO THE CANVAS.
}


// UPLOAD DETECTION AND PROCESSING
function onImageUpload(ev) {
    $("#error_message_offline").hide();
    var processor = new ImageProcessor();
    var fileField = ev.target;

    getDroppedImagesFromFiles(fileField.files);
    fileField.files = undefined;
    swapSentenceOnResizeButton();
}

function getDroppedImagesFromFiles(files) {
    var images = [];
    var errorFiles = [];
    //uploaded_images = [];

    var new_images = [];
    if (files.length > 0) {
        if (isValidFileType(files[0])) {
            var resizeJob = ImageProcessor.getUploadedResizeJob(files[0]);
            new_images.push(resizeJob);
            ga("send", "event", "Image Upload Success", "Free", resizeJob.originalExtension);
        } else {
            errorFiles.push(files[0]);
        }
    }

    if (new_images.length > 0) {
        uploaded_images = new_images;
    }

    showUploadError(errorFiles);
    showUploadedImagesAsync();
}

function resizeAgain() {
    resetToInitialStep();
}

function resetResizing() {
    uploaded_images = [];
    removeImagePreviews();
    resetToInitialStep();
}

function resetToInitialStep() {
    hideDownloadArea();
    $("#offline-file-field").val(null);
    zipJob = new ZipJob();
    setDropzoneVisibilities(uploaded_images);
    restoreOriginalResizeAreaTitles();
    showUploadSection();
    scrollToUploadSection("animated");
}

function isValidFileType(file) {
    return file.type == "image/jpeg"
        || file.type == "image/jpg"
        || file.type == "image/gif"
        || file.type == "image/png"
        || file.type == "image/bmp"
        || file.type == "image/tiff";
}

function showUploadError(errorFiles) {
    if (errorFiles.length == 0) {
        return;
    }
    var names = errorFiles.map(function (f) {
        return f.name;
    });
    //var errorMessage = "ERROR: " + toSentence(boldedNames) + " are not supported images. Please upload a JPG, PNG, GIF, BMP or TIFF";
    $("#error_message_offline #failedFilesList").html(toSentence(names));
    $("#error_message_offline").show();
}

function toSentence(arr) {
    if (arr.length == 0) {
        return "";
    }
    if (arr.length == 1) {
        return arr[0];
    }

    return arr.slice(0, arr.length - 1).join(', ') + ", " + (language == "en" ? "and" : "y") + " " + arr.slice(-1);
}

function showUploadedImagesAsync() {
    setTimeout("showUploadedImages()", 20);
}

function showUploadedImages() {
    removeImagePreviews();
    if (uploaded_images.length > 0) {
        showUploadedImage(uploaded_images[0]);

        if (isCanvasEnabled) {
            fillCanvas(uploaded_images[0].img);
        }

        showImagePlaceholders();

        hideDropzoneMessage();
    } else {
        showDropzoneMessage();
    }

    setDropzoneVisibilities(uploaded_images);
}

function hideDropzoneMessage() {
    $('.drag-section .drop-message').hide();
}

function showDropzoneMessage() {
    $('.drag-section .drop-message').show();
}

function generatePreviewPlaceholders(previewCount) {
    var generatedElements = []
    var placeholderImageSrc = 'img/placeholder-avatar.svg';
    var addImageButtonRedirectAddress = plans_url;

    for (i = 0; i < previewCount; i++) {
        var uploadedImage = $("#uploaded_image_mock").clone();
        var imageId = "image_previews_" + i;
        uploadedImage.attr("id", imageId);
        uploadedImage.attr("class", "uploaded_image preview-hide-metadata");

        var imagePreview = uploadedImage.find("img.preview");
        var filename = uploadedImage.find("div.filename");
        var addImageButton = uploadedImage.find("div.close_button");

        // Adds placeholder image to preview
        imagePreview.attr("src", placeholderImageSrc);

        // Swaps button
        addImageButton.attr("class", "close_button hide-close-button")

        filename.html("more_images.jpg");

        uploadedImage.on('click', function (event) {
            ga('send', 'event', "More images preview clicked", pro ? "Pro" : "Free");

            if (!pro) {
                // redirect to choose your plan
                window.location.href = addImageButtonRedirectAddress;
            } else {
                // otherwise open file navigation
                $('#offline-file-field').click();
            }

            event.stopPropagation();
        });

        generatedElements.push(uploadedImage)
    }
    return generatedElements
}

function showImagePlaceholders(uploadedImages) {
    var initialPlaceholderCount = pro ? 4 : 0;
    var previews;

    // If the user is pro, let's proceed to replace previews
    if (pro && uploadedImages >= 2) {
        // Get the latest position to replace the image
        initialPlaceholderCount = initialPlaceholderCount - (uploadedImages - 1)
        // Directly remove and replace list of previews
        $("div .preview-hide-metadata").remove();
    }

    // Otherwise, just generate the default value of previews
    previews = generatePreviewPlaceholders(initialPlaceholderCount)

    // Finally We append the end result to the section
    $("#upload-section #image_previews").append(previews);
}

function setDropzoneVisibilities(images) {
    if (images.length > 0) {
        $("#upload-section #reduce_images_button").css("display", "inline-block");
        $("#resize-form-offline").show();
    } else {
        $("#upload-section #reduce_images_button").css("display", "none");
        $("#resize-form-offline").hide();
    }
}

function removeImage(id) {
    for (var i = 0; i < uploaded_images.length; i++) {
        if (uploaded_images[i].id == id) {
            uploaded_images.splice(i, 1);
        }
    }
    $("#offline-file-field").val(null);
    showUploadedImages();
    swapSentenceOnResizeButton();
    if (uploaded_images.length == 0) {
        hideDownloadArea();
    }
}

function removeImagePreviews() {
    showDropzoneMessage();
    $("#upload-section #image_previews .uploaded_image").remove();
}

function showUploadedImage(imageModel) {
    var uploadedImage = $("#uploaded_image_mock").clone();
    uploadedImage.attr("id", "image_previews_" + imageModel.id);

    $("#upload-section #image_previews").append(uploadedImage);


    var imagePreview = uploadedImage.find("img.preview");
    var filename = uploadedImage.find("div.filename");
    var imagesize = uploadedImage.find("div.imagesize");
    var filesize = uploadedImage.find("div.filesize");
    var removeButton = uploadedImage.find("div.close_button");

    imagePreview.attr("src", imageModel.img.src);

    filename.html(imageModel.name);
    filename.attr("title", imageModel.name);
    imagesize.html(imageModel.img.naturalWidth + " x " + imageModel.img.naturalHeight);

    if (imageModel.img.naturalWidth == 0 && imageModel.img.naturalHeight == 0) {
        setTimeout("updateUploadedImageDimensions("+imageModel.id+")", 200);
        setTimeout("updateUploadedImageDimensions("+imageModel.id+")", 1000);
    }
    originalWidth = imageModel.img.width;
    originalHeight = imageModel.img.height;

    filesize.html(formatBytes(imageModel.file.size));

    removeButton.on('click', function (event) {
        removeImage(imageModel.id);
        event.stopPropagation();
    });
}

function updateUploadedImageDimensions(modelId) {
    let imgpreview = $('#image_previews_' + modelId + ' img.preview').first().get(0);
    let width = imgpreview.naturalWidth;
    let height = imgpreview.naturalHeight;
    let imagesizetag = $('#image_previews_' + modelId + ' div.imagesize').first();
    imagesizetag.html(width + " x " + height);
    originalWidth = width;
    originalHeight = height;
}

function formatBytes(a, b) {
    if (0 == a) return "0 Bytes";
    var c = 1024;
    var d = b || 2;
    var e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var f = Math.floor(Math.log(a) / Math.log(c));
    return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
}

function hideUploadSection() {
    $("#dropzone-container-offline").hide();
    $("#image_previews").hide();
    $("#resize-form-offline").hide();
}

function showUploadSection() {
    $("#dropzone-container-offline").show();
    $("#image_previews").show();
}

function showDropzone() {
    $("#dropzone-container-offline").show();
}

function hideDropzone() {
    $("#dropzone-container-offline").hide();
}


//////////////
// RESIZING //
//////////////
function submitResizeForm(event) {
    $(".button-and-filesize").addClass("hidden");
    $(".button-and-filesize").removeClass("visible-xs");
    $("#progress-section").removeClass("hidden");
    hideDownloadArea();


    showResizingPlaceholder();

    scrollToResizingSection("instant");

    resize_images();
}

if (document.getElementById("offline-submit-button")) {
    document.getElementById("offline-submit-button").addEventListener("click", submitResizeForm, false);
}

function resize_images() {
    zipJob = new ZipJob();
    initializeJobs();
    addResults();
    startResizingJobs();
    handleMultipleImagesLayout();
}

function initializeJobs() {
    initializeJob(uploaded_images[0]);
}

function initializeJob(job) {
    job.wantedWidth = $('#width_field').val();
    job.wantedHeight = $('#height_field').val();
    job.wantedUnits = $('#selector_units').val();
    job.wantedMode = selectedMode;
    job.wantedExtension = $('#selector_extension').val();
    job.wantedDpi = $('#resolution_field').val();
    job.wantedQuality = $('#sector_calidad input').val() / 100.0;
    job.wantedBackgroundColor = $("#background_color_field").val();
    job.progress = 0;
}

// DISPLAYING RESULTS
function addResults() {
    $('#final_image_buttons_container').empty();
    if (uploaded_images.length > 0) {
        addResultFile(uploaded_images[0]);
    }
}

function handleMultipleImagesLayout() {
    return uploaded_images.length > 1 ? $('#progress_and_download_area').addClass("multiple-download-images-layout") : $('#progress_and_download_area').removeClass("multiple-download-images-layout");
}

function updateElementPluralization(elementMatcher, condition, changingMethod) {
    var matchingElement = $(elementMatcher);
    var pluralSentence = matchingElement.attr("data-plural");
    var singularSentence = matchingElement.attr("data-singular");

    switch (changingMethod) {
        case TOGGLE_ELEMENT_SENTENCE_METHODS.VALUE:
            return condition ? matchingElement.val(pluralSentence) : matchingElement.val(singularSentence)
        case TOGGLE_ELEMENT_SENTENCE_METHODS.INNER_HTML:
            return condition ? matchingElement.html(pluralSentence) : matchingElement.html(singularSentence)
    }
}

function swapSentenceOnResizeButton() {
    updateElementPluralization("#resize-form-submit-container #offline-submit-button", uploaded_images.length > 1, TOGGLE_ELEMENT_SENTENCE_METHODS.VALUE)
}


function addResultFile(imageModel) {
    var resultDiv = $("#final-image-button-mock").clone();
    resultDiv.attr("id", "final_image_button_" + imageModel.id);

    var fileName = resultDiv.find("span.image-file-name");
    var fileSize = resultDiv.find("span.image-file-size");
    var imageResultPreview = resultDiv.find("img.image-file-icon");

    imageResultPreview.attr("src", imageModel.img.src);
    fileName.html(imageModel.getFinalFilename(imageModel.wantedExtension));

    updateProgressCircle(resultDiv, imageModel.progress);

    $("#final_image_buttons_container").append(resultDiv);
}

function hideDownloadArea() {
    $('#progress_and_download_area').hide();
    $('#extra_publi_below_downloads').empty();
}

function showDownloadArea() {
    var title = $('#progress_and_download_area #download_area_title');
    title.removeClass("singular");
    title.removeClass("plural");
    title.addClass(uploaded_images.length > 1 ? "plural" : "singular");
    $('#progress_and_download_area').show();
    $('#progress_and_download_area #final_image_buttons_container').hide().slideDown(100);
}

function startResizingJobs() {
    // We capture the start so we can begin tracking time of jobs
    startTimestampOfJobsExecution = performance.now();

    if (uploaded_images.length > 0) {
        processResizeJob(uploaded_images[0]);
    }
}

function processResizeJob(job) {
    showResizeResults = false;
    try {
        if (job.wantedUnits === "percent") {
            ImageProcessor.resizeImageByScale(job, job.wantedWidth / 100.0, job.wantedHeight / 100.0, job.wantedMode, job.wantedExtension, job.wantedQuality, job.wantedBackgroundColor);
        } else {
            // default for pixels is just the numbers in the fields
            let width = job.wantedWidth;
            let height = job.wantedHeight;

            if (job.wantedUnits === "centimeters") {
                let dots_per_cm = job.wantedDpi / 2.54;
                width = Math.round(width * dots_per_cm);
                height = Math.round(height * dots_per_cm);
            } else if (job.wantedUnits === "inches") {
                width = Math.round(width * job.wantedDpi);
                height = Math.round(height * job.wantedDpi);
            }

            ImageProcessor.resizeImageBySize(job, width, height, job.wantedMode, job.wantedExtension, job.wantedQuality, job.wantedBackgroundColor);
        }
        showResizeResults = true
    } catch (e) {
        console.log(e);
        job.setFinalImageString("");
    }
}

// PROGRESS
function updateProgressCircle(resultDiv, percentage) {
    if (percentage >= 100) {
        resultDiv.find("div.progress_circle_container").hide();
        resultDiv.find("img.download_icon").show();
    } else {
        resultDiv.find("div.progress_circle_container").show();
        resultDiv.find("img.download_icon").hide();
    }

    var progressCanvasContainer = resultDiv.find("div.progress_circle_container");
    var can = progressCanvasContainer.find('.progress_circle_canvas').get(0),
        spanPercent = progressCanvasContainer.find('.progress_circle_text').get(0),
        c = can.getContext('2d');

    var posX = can.width / 2;
    var posY = can.height / 2;
    var borderWidth = 5;
    var onePercentAngle = 360 / 100;
    var angle = onePercentAngle * percentage;
    var radius = posX - borderWidth / 2;

    c.lineCap = 'bottom';

    c.clearRect(0, 0, can.width, can.height);

    spanPercent.innerHTML = percentage.toFixed();

    c.beginPath();
    c.arc(posX, posY, radius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360));
    c.strokeStyle = '#ddd';
    c.lineWidth = borderWidth;
    c.stroke();

    c.beginPath();
    c.strokeStyle = '#3ABBA2';
    c.lineWidth = borderWidth;
    c.arc(posX, posY, radius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + angle));
    c.stroke();
}

function getExtension(filename) {
    var regex = /(?:\.([^.]+))?$/;
    return regex.exec(filename)[1];
}

// IMAGE MODEL
function ResizeJob(id, name, file, img) {
    this.id = id;
    this.name = name;
    this.file = file;
    this.img = img;
    this.progress = 0;
    this.finalImageString = "";
    this.originalExtension = getExtension(name);

    this.wantedWidth = 1;
    this.wantedHeight = 1;
    this.wantedUnits = "percent";
    this.wantedMode = "stretch";
    this.wantedExtension = "jpeg";
    this.wantedQuality = 90;
    this.wantedDpi = 72;
    this.wantedBackgroundColor = "#FFFFFFFF";

    var self = this;

    this.getFinalFilename = function (extension) {
        var finalExtension = extension.replace("jpeg", "jpg");
        return name.replace(/\.[A-Za-z]*$/i, "." + finalExtension);
    }

    this.getResultDiv = function () {
        return $('#final_image_button_' + this.id);
    }

    this.singleImageDownload = function (dataset, event) {
        ga('send', 'event', 'Download image', (pro ? "Pro" : "Free"));
        ImageProcessor.downloadImageFromResizeJob(dataset);
        event.stopPropagation();
    }

    this.updateResultInfo = function () {
        var resultContainer = this.getResultDiv();

        var fileSize = resultContainer.find("span.image-file-size");
        fileSize.html(this.getFinalFilesizeString());
        resultContainer.attr("data-id", this.id);

        var imageResultPreview = resultContainer.find("img.image-file-icon");
        imageResultPreview.attr("src", this.finalImageString);

        // Download by clicking on image
        resultContainer.off('click');
        resultContainer.on('click', function (event) {
            self.singleImageDownload(this.dataset.id, event)
        });

        // Download by clicking on Download Button
        var downloadOverallButtonId = "#download-button-container-cta";
        var downloadOverallButton = $(downloadOverallButtonId);
        downloadOverallButton.attr("data-id", this.id);
        downloadOverallButton.off('click');
        downloadOverallButton.on('click', function (event) {
            if (uploaded_images.length === 1) {
                self.singleImageDownload(this.dataset.id, event)
            } else {
                downloadZip();
            }
        });
        updateElementPluralization(downloadOverallButtonId, uploaded_images.length > 1, TOGGLE_ELEMENT_SENTENCE_METHODS.INNER_HTML);

    }

    this.getFinalFilesizeString = function () {
        if (this.finalImageString.length <= 23) {
            return "ERROR";
        }
        return formatBytes((this.finalImageString.length - 23) * 0.75);
    }

    this.setProgress = function (progress) {
        this.progress = progress;
        //updateProgressCircle(this.getResultDiv(), progress);
        showResizingInProgressSection();
    }

    this.setFinalImageString = function (finalImageString) {
        this.finalImageString = finalImageString;

        // changing DPI of result image to whatever was selected...
        if (this.wantedDpi !== 72) {
            this.finalImageString = changeDpiDataUrl(finalImageString, this.wantedDpi);
        }

        // If we have more than 1 image we start queueing the files to zip
        if (uploaded_images.length > 1) {
            this.sendToZipQueue();
        }

        this.setProgress(100);
        this.updateResultInfo();
        incrementImageCounter();

        if (!paralellizeDownloads) {
            downloadNextIfNeeded();
        }
        ga("send", "event", "Image Resize Success", (pro ? "Pro" : "Free"), this.wantedExtension);

    }

    this.sendToZipQueue = function () {
        zipJob.addFilesToQueue(this.getFinalFilename(this.wantedExtension), this.finalImageString);
    }
}

function downloadNextIfNeeded() {
}

function scrollToUploadSection(mode) {
    scrollToElement($("#upload-section"), -50);
}

function scrollToResizingSection(mode) {
    scrollToElement($("#resizing-image-placeholder"), -150);
}

function scrollToResultsSection(mode) {
    scrollToElement($("#progress_and_download_area"), -150);
}

function scrollToElement(element, offset) {
    $([document.documentElement, document.body]).scrollTop(element.offset().top + offset);
}

function showResizingPlaceholder() {
    $("#resizing-image-placeholder").show();

    if (!pro && !addedDownloadAreaAd) {
        add_new_ad("extra_publi_below_downloads");
        loadOneAd();
        addedDownloadAreaAd = true;
    }
}

function hideResizingPlaceholder() {
    $("#resizing-image-placeholder").hide();
}

function displayResults() {
    hideResizingPlaceholder();
    showResizedTitles();
    showDownloadArea();
    scrollToResultsSection("instant");
}

function restoreOriginalResizeAreaTitles() {
    $("#upload-section .title").show();
}

function showResizedTitles() {
    updateElementPluralization("#resized-image-title", uploaded_images.length > 1, TOGGLE_ELEMENT_SENTENCE_METHODS.INNER_HTML)
    updateElementPluralization("#try-resizing-again-subtitle", uploaded_images.length > 1, TOGGLE_ELEMENT_SENTENCE_METHODS.INNER_HTML)
}

function getAllFinishedJobs() {
    return uploaded_images.filter(function (currentJob) {
        return currentJob.progress === 100
    })
}

function showResizingInProgressSection() {
    var minimumDelayTime = 0; // 1 second in Miliseconds
    var finishedJobs = getAllFinishedJobs();
    var jobsFinishedCondition = (finishedJobs.length > 0 && uploaded_images.length > 0) && finishedJobs.length === uploaded_images.length

    if (jobsFinishedCondition) {
        // Once the job are finished, we capture the time again, i.e. the finishing time
        var finishTimestampOfJobsExecution = performance.now();
        // We calculate the running time to compare whether we need to add delay or not
        var elapsedTime = finishTimestampOfJobsExecution - startTimestampOfJobsExecution;

        // If we have more than one image, we check the status of the ZipJob
        if (pro & uploaded_images.length > 1) {
            waitForCallbackConditionToFulfill(function () {
                return zipJob.zipJobsFinished === true
            })
                .then(function () {
                        displayResultsHandler(minimumDelayTime, elapsedTime)
                    }
                );
        } else {
            // Otherwise, we skip checking for the ZipJob status and continue
            displayResultsHandler(minimumDelayTime, elapsedTime)
        }
    }
}

function displayResultsHandler(minimumDelayTime, elapsedTime) {
    // We decide to use the delay when the elapsed time is less than one second
    if (elapsedTime < minimumDelayTime) {
        // We utilize minimumDelayTime - elapsedTime to calculate the remaining time to reach the minimum
        setTimeout(function () {
            displayResults()
        }, minimumDelayTime - elapsedTime)
    } else if (elapsedTime > minimumDelayTime) {
        // Otherwise, we let the finishing time unaltered and execute when needed.
        displayResults()
    }
}

function ZipJob() {
    // We instantiate a new writer creating the container for the zip
    this.zipWriter = new zip.ZipWriter(new zip.Data64URIWriter("application/zip"));
    this.dataURI = "";
    this.addedFiles = 0;
    this.zipJobsFinished = false;
    this.fileNames = [];

    var self = this;

    // We add files to queue from the ResizeJob
    this.addFilesToQueue = function (fileName, finalBlob) {
        let file = {name: fileName, blob: finalBlob};

        self.addFileToZip(file);
    }

    // Read files from queue and add it to zipWriter
    this.addFileToZip = async function (file) {
        // We define the options in the object below
        // With bufferedWrite we can allow calling ZipWriter.add multiple times in parallel
        let writerOptions = {bufferedWrite: true};

        // We grab the matching file name for the slot in the zip
        let fileName = file.name;
        let index = 0;

        while (this.fileNames.includes(fileName)) {
            index++;
            let suffix = index === 0 ? "" : index;
            let dotIndex = file.name.lastIndexOf(".");
            fileName = file.name.substring(0, dotIndex) + " (" + suffix + ")" + file.name.substring(dotIndex);
        }

        this.fileNames.push(fileName);

        // We grab the compressed blob from ResizeJob and read it, so we can add it to the zip
        let compressedImageBlobReader = new zip.Data64URIReader(file.blob);
        // We add it to the zip container
        await this.zipWriter.add(fileName, compressedImageBlobReader, writerOptions);
        self.addedFiles = self.addedFiles + 1;

        // Finally, we evaluate if we can close the zip inside the closeZip method
        if (self.addedFiles === uploaded_images.length) {
            this.closeZip();
        }
    }

    // We wait for the closing of the zip container and we get the final URL
    this.closeZip = async function () {
        var finishedUrl = await this.zipWriter.close();
        this.dataURI = await finishedUrl

        // When dataURI has data on it, it means that the final URL returned from the zipJob
        if (this.dataURI.length > 1) {
            // When we have this URL, we pass it down to the downloadZipHandler so we can download it
            //downloadZip(this.dataURI);
            // And we mark the zipJobs finished so we can move in the showResizingInProgressSection method
            this.zipJobsFinished = true;
        }
    }
}

function waitForCallbackConditionToFulfill(callbackCondition) {
    var retryPollTime = 100;

    const poll = resolve => {
        if (callbackCondition()) resolve();
        else setTimeout(_ => poll(resolve), retryPollTime);
    }

    return new Promise(poll);
}

// This method when we have a zipAvailable, intercepts the click of the Download Button
// Clicking instead an anchor with the loaded zip URL and download filename.
function downloadZip() {
    var fileName = "reduced-images";
    var downloadButton = $("#download-button")
    var anchor = document.createElement("a");
    var clickEvent = new MouseEvent("click");

    anchor.href = zipJob.dataURI;
    ;
    anchor.download = fileName;
    anchor.dispatchEvent(clickEvent);

    for (var i = 0; i < zipJob.addedFiles; i++) {
        ga('send', 'event', 'Download image', (pro ? "Pro" : "Free"));
    }
    ga('send', 'event', 'Download zip', (pro ? "Pro" : "Free"), zipJob.addedFiles);
}

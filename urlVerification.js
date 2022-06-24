module.exports.urlVerification = (url) => {
    if (url === null || url === "") {
        console.log("no url input, clear to go.");
        return url;
    } else if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("//")
    ) {
        console.log("Expected URL ");
        return url;
    } else {
        console.log("URL needs editing");
        url = "https://" + url;
        console.log("url after manipulation: ", url);
        return url;
    }
};

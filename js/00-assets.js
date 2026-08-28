// Atlas-backed asset loader with cached direct-image fallback for dev workflows.
var assetAtlasManifest = typeof window != "undefined" ? window.ASSET_ATLAS_MANIFEST : null
var assetAtlasImages = []
var assetDirectImages = {}
var ASSET_SOURCE_BASE_PATH = "assets-src/"

function getDirectAssetPath(name) {
    if(name.indexOf("/") != -1 || name.indexOf("\\") != -1) {
        return name
    }

    return ASSET_SOURCE_BASE_PATH + name
}

function getAssetAtlasSprite(name) {
    if(assetAtlasManifest == null || assetAtlasManifest.sprites == null) {
        return null
    }

    return assetAtlasManifest.sprites[name] || null
}

function ensureAssetAtlasImage(atlasIndex) {
    if(assetAtlasManifest == null || assetAtlasManifest.atlases == null || assetAtlasManifest.atlases[atlasIndex] == null) {
        return null
    }

    if(assetAtlasImages[atlasIndex] == null) {
        var atlasImage = new Image()
        atlasImage.src = assetAtlasManifest.atlases[atlasIndex].src
        assetAtlasImages[atlasIndex] = atlasImage
    }

    return assetAtlasImages[atlasIndex]
}

function ensureDirectAssetImage(name) {
    if(assetDirectImages[name] == null) {
        var directImage = new Image()
        directImage.src = getDirectAssetPath(name)
        assetDirectImages[name] = directImage
    }

    return assetDirectImages[name]
}

function preloadAssetAtlases() {
    if(assetAtlasManifest == null || assetAtlasManifest.atlases == null) {
        return
    }

    for(var i = 0; i < assetAtlasManifest.atlases.length; i++) {
        ensureAssetAtlasImage(i)
    }
}

function drawAsset(name, x, y, width, height) {
    if(name == "") {
        return
    }

    var sprite = getAssetAtlasSprite(name)
    if(sprite != null) {
        var atlasImage = ensureAssetAtlasImage(sprite.atlas)
        if(atlasImage != null && atlasImage.complete) {
            ctx.drawImage(atlasImage, sprite.x, sprite.y, sprite.width, sprite.height, x, y, width, height)
        }
        return
    }

    var directImage = ensureDirectAssetImage(name)
    ctx.drawImage(directImage, x, y, width, height)
}

function drawCenteredAsset(name, centerX, centerY, radius) {
    drawAsset(name, centerX - radius, centerY - radius, radius * 2, radius * 2)
}

function drawRotatedCenteredAsset(name, centerX, centerY, radius, rotationAngle) {
    if(name == "") {
        return
    }

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationAngle)
    drawAsset(name, -radius, -radius, radius * 2, radius * 2)
    ctx.restore()
}

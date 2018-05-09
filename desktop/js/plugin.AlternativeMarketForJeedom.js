$(document).ready(function () {
    initDataModal();
    initInstallationButtons();
});

/**
 * Initialise la fenêtre modale du plugin
 */
function initDataModal() {
    var defaultBranch = currentPlugin['defaultBranch'];
    var fullName = currentPlugin['fullName'];
    $('#plugin-icon').attr('src', currentPlugin['iconPath']);
    $('#description-content').text(currentPlugin['description']);
    $('#author .list-info').text(currentPlugin['author']);
    $('#licence .list-info').text(currentPlugin['licence']);
    $('#category .list-info').text(currentPlugin['category']);
    $('#gitid .list-info').text(currentPlugin['gitId']);
    $('#gitrepo .list-info').text(currentPlugin['gitName']);

    if (currentPlugin['changelogLink'] === null) {
        $('#changelog-link').css('display', 'none');
    }
    else {
        $('#changelog-link').attr('href', currentPlugin['changelogLink']);
    }
    if (currentPlugin['documentationLink'] === null) {
        $('#documentation-link').css('display', 'none');
    }
    else {
        $('#documentation-link').attr('href', currentPlugin['documentationLink']);
    }
    $('#github-link').attr('href', 'https://github.com/' + fullName);
    $('#travis-badge').attr('href', 'https://travis-ci.org/' + fullName + '?branch=' + defaultBranch);
    $('#travis-badge img').attr('src', 'https://travis-ci.org/' + fullName + '.svg?branch=' + defaultBranch);
    $('#coveralls-badge').attr('href', 'https://coveralls.io/github/' + fullName + '?branch=' + defaultBranch);
    $('#coveralls-badge img').attr('src', 'https://coveralls.io/repos/github/' + fullName + '/badge.svg?branch=' + defaultBranch);
    $('#waffle-badge').attr('href', 'https://waffle.io/' + fullName);
    $('#waffle-badge img').attr('src', 'https://badge.waffle.io/' + fullName + '.svg?columns=all');
}

function initInstallationButtons() {
    $('#install-plugin').click(function () {
        installPlugin(currentPlugin['defaultBranch']);
    });
    if (currentPlugin['installed']) {
        $('#remove-plugin').click(function() {
            removePlugin(currentPlugin['id']);
        });
        if (currentPlugin['installedBranchData'] !== false) {
            $('#install-plugin').parent().hide();
            var installedBranch = currentPlugin['installedBranchData']['branch'];
            $('#default-branch-information').text('Branche ' + installedBranch);
            initBranchesChoice(currentPlugin['branchesList'], installedBranch);
            if (currentPlugin['installedBranchData']['needUpdate'] === true) {
                $('#update-plugin').click(function() {
                    updatePlugin(currentPlugin['installedBranchData']['id']);
                });
            }
            else {
                $('#update-plugin').hide();
            }
        }
        else {
            // Nécessaire si les plugins ont été installés depuis l'URL
            // TODO : Optimiser en supprimant le doublon de code
            var defaultBranch = currentPlugin['defaultBranch'];
            $('#default-branch-information').text('Branche ' + defaultBranch);
            $('#update-plugin').hide();
            if (currentPlugin['branchesList'].length > 0) {
                initBranchesChoice(currentPlugin['branchesList'], defaultBranch);
            }
            else {
                $('#get-branches-informations button').click(function () {
                    initBranchesUpdate(currentPlugin['defaultBranch']);
                });
            }
        }
    }
    else {
        $('#remove-plugin').hide();
        $('#update-plugin').hide();
        var defaultBranch = currentPlugin['defaultBranch'];
        $('#default-branch-information').text('Branche ' + defaultBranch);
        if (currentPlugin['branchesList'].length > 0) {
            initBranchesChoice(currentPlugin['branchesList'], defaultBranch);
        }
        else {
            $('#get-branches-informations button').click(function () {
                initBranchesUpdate(currentPlugin['defaultBranch']);
            });
        }
    }
}

/**
 * Evènement du bouton de mise à jour des branches
 */
function initBranchesUpdate(defaultBranchChoice) {
    $.post({
        url: 'plugins/AlternativeMarketForJeedom/core/ajax/AlternativeMarketForJeedom.ajax.php',
        data: {
            action: 'get',
            params: 'branches',
            data: {source: currentPlugin['sourceName'], fullName: currentPlugin['fullName']}
        },
        dataType: 'json',
        success: function (data, status) {
            initBranchesChoice(data['result'], defaultBranchChoice);
        },
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        }
    });
}

/**
 * Initalise le bouton de choix des branches
 *
 * @param branchesList Liste des branches
 */
function initBranchesChoice(branchesList, defaultBranchChoice) {
    if (branchesList.length > 1) {
        var ulList = $('#install-plugin-advanced .dropdown-menu');
        for (var branchIndex = 0; branchIndex < branchesList.length; ++branchIndex) {
            var branchName = branchesList[branchIndex]['name'];
            if (branchName !== defaultBranchChoice) {
                var liItem = $('<li data-branch="' + branchName + '"><a href="#">Installer la branche ' + branchName + '</a></li>');
                liItem.click(function () {
                    installPlugin($(this).data('branch'));
                });
                ulList.append(liItem);
            }
        }
        $('#get-branches-informations').css('display', 'none');
        $('#install-plugin-advanced').css('display', 'block');
    }
    else {
        $('#get-branches-informations').html('Pas d\'autres branches disponibles');
    }
}

/**
 * Lance l'installation du plugin
 */
function installPlugin(branch) {
    $.post({
        url: 'core/ajax/update.ajax.php',
        data: {
            action: 'save',
            // Version de l'installation par URL
//            update: '{"logicalId":"' + currentPlugin['id'] + '","configuration":{"url":"' + currentPlugin['url'] + '/archive/' + branch + '.zip"},"source":"url"}'
            // Version de l'installation par GitHub
            update: '{"logicalId":"' + currentPlugin['id'] + '","configuration":{"user":"' + currentPlugin['gitId'] + '", "repository":"'+ currentPlugin['gitName'] +'", "version":"'+ branch +'"},"source":"github"}'

        },
        dataType: 'json',
        success: function (data, status) {
            window.location.replace('/index.php?v=d&p=plugin&id='+currentPlugin['id']);
        },
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        }
    });
}

/**
 * Lance l'installation du plugin
 */
function removePlugin(pluginId) {
    $.post({
        url: 'core/ajax/update.ajax.php',
        data: {
            action: 'remove',
            id: pluginId

        },
        dataType: 'json',
        success: function (data, status) {
            location.reload();
        },
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        }
    });
}

/**
 * Lance l'installation du plugin
 */
function updatePlugin(id) {
    $.post({
        url: 'core/ajax/update.ajax.php',
        data: {
            action: 'update',
            id: id

        },
        dataType: 'json',
        success: function (data, status) {
            location.reload();
        },
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        }
    });
}
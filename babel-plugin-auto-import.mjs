import { basename } from 'path';

const ImportTypeEnum = {
  /*support:import * as namespace*/
  NAMESPACE: Symbol("NAMESPACE"),
  DEFAULT: Symbol("DEFAULT"),
  MEMBER: Symbol("MEMBER"),
  ANONYMOUS: Symbol("ANONYMOUS")
};

export default function (_ref) {
  var t = _ref.types;
  return {
    visitor: {
      Identifier: function Identifier(path, _ref2) {
        var options = _ref2.opts,
            file = _ref2.file;
        if (!path.isReferencedIdentifier()) return;
        var identifier = path.node,
            scope = path.scope;
        if (isDefined(identifier, scope)) return;
        var declarations = options.declarations;
        if (!Array.isArray(declarations)) return;
        var filename = file.opts.filename ? basename(file.opts.filename) : "";
        declarations.forEach(handleDeclaration, {
          path: path,
          identifier: identifier,
          filename: filename
        });
      }
    }
  };

  function isDefined(identifier, _ref3) {
    var bindings = _ref3.bindings,
        parent = _ref3.parent;
    var variables = Object.keys(bindings);
    if (variables.some(has, identifier)) return true;
    return parent ? isDefined(identifier, parent) : false;
  }

  function has(identifier) {
    var name = this.name;
    return identifier == name;
  }

  function handleDeclaration(declaration) {
    var path = this.path,
        identifier = this.identifier,
        filename = this.filename;
    if (!declaration) return;
    var program = path.findParent(function (path) {
      return path.isProgram();
    });
    var pathToModule = getPathToModule(declaration, filename);
    var types = [];

    if (hasDefault(declaration, identifier)) {
      types.push(ImportTypeEnum.DEFAULT);
    }

    if (hasMember(declaration, identifier)) {
      types.push(ImportTypeEnum.MEMBER);
    }

    if (hasAnonymous(declaration, identifier)) {
      types.push(ImportTypeEnum.ANONYMOUS);
    }
    /**
     * support:
     * import * as somethingModule from 'something';
     * import something from 'something';
     */


    if (hasNamespace(declaration, identifier)) {
      types.push(ImportTypeEnum.NAMESPACE);
    }

    insertImport(program, identifier, types, pathToModule);
  }

  function hasDefault(declaration, identifier) {
    return declaration["default"] == identifier.name;
  }

  function hasNamespace(declaration, identifier) {
    return declaration["namespace"] == identifier.name;
  }

  function hasMember(declaration, identifier) {
    var members = Array.isArray(declaration.members) ? declaration.members : [];
    return members.some(has, identifier);
  }

  function hasAnonymous(declaration, identifier) {
    var anonymous = Array.isArray(declaration.anonymous) ? declaration.anonymous : [];
    return anonymous.some(has, identifier);
  }

  function generateSpecifiers(identifier, types) {
    return types.reduce(function (accum, type) {
      switch (type) {
        case ImportTypeEnum.DEFAULT:
          {
            accum.push(t.importDefaultSpecifier(identifier));
            break;
          }

        case ImportTypeEnum.NAMESPACE:
          {
            /*skip it , will add an another import statement for namespace*/
            break;
          }

        case ImportTypeEnum.ANONYMOUS:
          {
            break;
          }

        case ImportTypeEnum.MEMBER:
          {
            accum.push(t.importSpecifier(identifier, identifier));
            break;
          }
      }

      return accum;
    }, []);
  }

  function insertImport(program, identifier, types, pathToModule) {
    var programBody = program.get("body");
    var currentImportDeclarations = programBody.reduce(toImportDeclarations, []);
    types.forEach(function (type) {
      var importDidAppend;
      importDidAppend = currentImportDeclarations.some(importAlreadyExists, {
        identifier: identifier,
        type: type,
        pathToModule: pathToModule
      });
      if (importDidAppend) return;
      importDidAppend = currentImportDeclarations.some(addToImportDeclaration, {
        identifier: identifier,
        type: type,
        pathToModule: pathToModule
      });
      if (importDidAppend) return;

      if (types.includes(ImportTypeEnum.NAMESPACE)) {
        program.unshiftContainer("body", t.importDeclaration([t.importNamespaceSpecifier(identifier)], t.stringLiteral(pathToModule)));
      }

      var specifiers = generateSpecifiers(identifier, types);
      var importDeclaration = t.importDeclaration(specifiers, t.stringLiteral(pathToModule));
      program.unshiftContainer("body", importDeclaration);
    });
  }

  function toImportDeclarations(list, currentPath) {
    if (currentPath.isImportDeclaration()) list.push(currentPath);
    return list;
  }

  function importAlreadyExists(_ref4) {
    var importDeclaration = _ref4.node;
    var identifier = this.identifier,
        type = this.type,
        pathToModule = this.pathToModule;

    if (importDeclaration.source.value == pathToModule) {
      if (type == ImportTypeEnum.ANONYMOUS) return true;
      return importDeclaration.specifiers.some(checkSpecifierLocalName, identifier);
    }
  }

  function checkSpecifierLocalName(specifier) {
    var identifier = this;
    return specifier.local.name == identifier.name;
  }

  function addToImportDeclaration(importDeclarationPath) {
    var identifier = this.identifier,
        type = this.type,
        pathToModule = this.pathToModule;
    var node = importDeclarationPath.node;
    if (node.source.value != pathToModule) return false;
    var specifiers = node.specifiers;

    if (type == ImportTypeEnum.DEFAULT) {
      if (!specifiers.some(hasImportDefaultSpecifier)) {
        var specifier = t.importDefaultSpecifier(identifier);
        importDeclarationPath.unshiftContainer("specifiers", specifier);
        return true;
      }
    }

    if (type == ImportTypeEnum.MEMBER) {
      if (!specifiers.some(hasSpecifierWithName, identifier)) {
        var _specifier = t.importSpecifier(identifier, identifier);

        importDeclarationPath.pushContainer("specifiers", _specifier);
        return true;
      }
    }
  }

  function hasImportDefaultSpecifier(node) {
    return t.isImportDefaultSpecifier(node);
  }

  function hasSpecifierWithName(node) {
    if (!t.isImportSpecifier(node)) return false;
    var name = this.name;
    return node.imported.name == name;
  }

  function getPathToModule(declaration, filename) {
    if (declaration.path.includes("[name]")) {
      var pattern = declaration.nameReplacePattern || "\\.js$";
      var newSubString = declaration.nameReplaceString || "";
      var name = filename.replace(new RegExp(pattern), newSubString);
      return declaration.path.replace("[name]", name);
    }

    return declaration.path;
  }
};

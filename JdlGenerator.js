define(function (require, exports, module) {
    "use strict";

    var Repository = app.getModule("core/Repository"),
        ProjectManager = app.getModule("engine/ProjectManager"),
        Engine = app.getModule("engine/Engine"),
        FileSystem = app.getModule("filesystem/FileSystem"),
        FileUtils = app.getModule("file/FileUtils"),
        Async = app.getModule("utils/Async"),
        UML = app.getModule("uml/UML"),
        Dialogs = app.getModule("dialogs/Dialogs");
    var CodeGenUtils = require("CodeGenUtils");
    var outputString = "";
    var codeWriter = new CodeGenUtils.CodeWriter("    ");
    /**
    * JDL Generator
    * @constructor
    * 
    *
    * @param {type.UMLPackage} baseModel
    * @param {string} basePath generated files and directories to be placed
    */
    function JdlGenerator(baseModel, basePath) {

        /** @member {type.Model} */
        this.baseModel = baseModel;

        /** @member {string} */
        this.basePath = basePath;
    }

    /**
     * Generate codes from a given element
     * @param {type.Model} elem
     * @param {string} path 
     * @param {string} path1 
     * @param {string} path2
     * @param {string} path3
     * @param {string} path4
     * @param {Object} options
     * @param {string} domain
     * @param {string} repository
     * @param {string} service
     * @param {string} serviceimpl
     * @param {string} rest
     * @return {$.Promise}
     */
    var directory;
    var directoryRepository;
    var directoryService ;
    var directoryServiceImpl ;
    var directoryRest ;
    JdlGenerator.prototype.generate = function (elem, path, path1 , path2, path3 ,path4 , domain, repository, service ,serviceimpl ,controller ,options) {
        var result = new $.Deferred(),
            self = this;
        var isAnnotationType = elem.stereotype;



        // Package
        if (elem instanceof type.UMLPackage) {
            //
            console.log(elem.ownedElements);


            //  parant = pathprojet + elem.name ;

            directory = FileSystem.getDirectoryForPath(path + "/" + elem.name);
            directory.create();

            directoryRepository = FileSystem.getDirectoryForPath(path1+"/"+ elem.name);
            directoryRepository.create();

            directoryService = FileSystem.getDirectoryForPath(path2+"/"+ elem.name);
            directoryService.create();

            directoryServiceImpl = FileSystem.getDirectoryForPath(path3+"/"+ elem.name);
            directoryServiceImpl.create();

            directoryRest = FileSystem.getDirectoryForPath(path4+"/"+ elem.name);
            directoryRest.create();
            console.log("Ready to write data");
            // console.log(codeWriter.getData());
            for (var i = 0; i < elem.ownedElements.length; i++) {
                if (elem instanceof type.UMLPackage) {
                    self.generate(elem.ownedElements[i], path + "/" + elem.name, path1+"/"+elem.name, path2+"/"+elem.name , path3+"/"+elem.name,path4+"/"+elem.name, domain + "." + elem.name, repository+"."+elem.name,service+"."+elem.name ,serviceimpl+"."+elem.name ,rest+"."+elem.name , options);
                }
                else {
                    self.generate(elem.ownedElements[i], path, path1,path2 ,path3 ,path4 , domain,repository,service,serviceimpl ,rest, options);
                }
            }

        } else if (elem instanceof type.UMLClass) {
            // AnnotationType
            if (isAnnotationType === "abstract") {

                console.log('annotationType generate' + elem.name);
                console.log(codeWriter.getJavaData());
                var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
                var files = FileSystem.getFileForPath(path + "/" + name + ".java");
                this.writeClassAbstractype(codeWriter, elem, domain, options, isAnnotationType);
                FileUtils.writeText(files, codeWriter.getJavaData(), true)
                    .then(result.resolve, result.reject);
                codeWriter.deleteJavaLines();

            } else if (isAnnotationType === "interface") {

                console.log('annotationType generate' + elem.name);
                console.log(codeWriter.getJavaData());
                var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
                var files = FileSystem.getFileForPath(path + "/" + name + ".java");
                this.writeClassInterfaceType(codeWriter, elem, domain, options, isAnnotationType);

                FileUtils.writeText(files, codeWriter.getJavaData(), true)
                    .then(result.resolve, result.reject);
                codeWriter.deleteJavaLines();

            } else if (isAnnotationType === "Entity") {
                // Class Entity
                console.log('annotationType generate ' + elem.name);
                var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
                console.log(codeWriter.getJavaData());
                var file = FileSystem.getFileForPath(path + "/" + name + ".java");

                this.writeClass(codeWriter, elem, domain, options, isAnnotationType);
                FileUtils.writeText(file, codeWriter.getJavaData(), false)
                    .then(result.resolve, result.reject);
                codeWriter.deleteJavaLines();

                var fileRepository = FileSystem.getFileForPath(path1 + "/" + name+"Repository" + ".java");

                this.writeClassRepository(codeWriter, elem, domain,repository, options);
                FileUtils.writeText(fileRepository, codeWriter.getJavaData(), false)
                    .then(result.resolve, result.reject);
                codeWriter.deleteJavaLines();

                var fileService = FileSystem.getFileForPath(path2 + "/" + name+"Service" + ".java");

                this.writeClassService(codeWriter, elem, domain,service, options);
                FileUtils.writeText(fileService, codeWriter.getJavaData(), false)
                    .then(result.resolve, result.reject);
                codeWriter.deleteJavaLines();

                var fileServiceImpl = FileSystem.getFileForPath(path3 + "/" + name+"ServiceImpl" + ".java");

                this.writeClassServiceImpl(codeWriter, elem, domain,service , serviceimpl, repository , options);
                FileUtils.writeText(fileServiceImpl, codeWriter.getJavaData(), false)
                    .then(result.resolve, result.reject);
                codeWriter.deleteJavaLines();

                var fileRest = FileSystem.getFileForPath(path4 + "/" + name+"Controller" + ".java");

                this.writeClassRest(codeWriter, elem, domain,service  ,controller , options);
                FileUtils.writeText(fileRest, codeWriter.getJavaData(), false)
                    .then(result.resolve, result.reject);
                codeWriter.deleteJavaLines();

            } else {
                console.log('annotationType generate ' + elem.name);
                var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
                console.log(codeWriter.getJavaData());
                var file = FileSystem.getFileForPath(path + "/" + name + ".java");
                //  this.writeClass(codeWriter, elem, domain, options, isAnnotationType);
                // codeWriter.writeJavaLine("Mansouri: "+directory);
                this.writenopersist(codeWriter, elem, domain, options, isAnnotationType);

                FileUtils.writeText(file, codeWriter.getJavaData(), false)
                    .then(result.resolve, result.reject);
                codeWriter.deleteJavaLines();
            }
        } else if (elem instanceof type.UMLEnumeration) {
            // Enum
            console.log('annotationType generate' + elem.name);
            console.log(codeWriter.getJavaData());
            var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);

            var files = FileSystem.getFileForPath(path + "/" + name + ".java");
            this.writeEnum(codeWriter, elem, domain, options, isAnnotationType);

            FileUtils.writeText(files, codeWriter.getJavaData(), false)
                .then(result.resolve, result.reject);
            codeWriter.deleteJavaLines();

        } else if (elem instanceof type.UMLInterface) {
            //Interface
            console.log('annotationType generate' + elem.name);
            console.log(codeWriter.getJavaData());
            var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
            var files = FileSystem.getFileForPath(path + "/" + name + ".java");
            this.writeClassInterfaceType(codeWriter, elem, domain, options, isAnnotationType);

            FileUtils.writeText(files, codeWriter.getJavaData(), true)
                .then(result.resolve, result.reject);
            codeWriter.deleteJavaLines();
        }
        else {
            // Others (Nothing generated.)
            console.log('nothing generate');
            result.resolve();
        }
        return result.promise();

    };
    /**
 * write Class abstract
 * @param {StringWriter} codeWriter
 * @param {type.Model} elem
 * @param {Object} options
 */
    JdlGenerator.prototype.writeClassAbstractype = function (codeWriter, elem, domain, options, isAnnotationType) {
        //Class Abstarct
        var i, j, k, lenex, lenattribute, len, termsClass = [];
        var termsImport = [];
        var termsAnnotation = [];
        var termsAssoation = [];
        var termsVairiable = [];
        var domain1;
        var termsGetteurSetteur = [];

        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);

        termsImport.push("package " + domain + " ;\n");
        termsImport.push("import com.fasterxml.jackson.annotation.*;\n");
        // termsImport.push("import org.hibernate.annotations.Cache;\n");
        // termsImport.push("import org.hibernate.annotations.CacheConcurrencyStrategy;\n");
        termsImport.push("import javax.persistence.*;\n");
        termsImport.push("import java.io.Serializable;\n");
        termsImport.push("import java.time.LocalDate;\n");
        termsImport.push("import java.util.*;\n");
        //  termsImport.push("/**");
        //  termsImport.push("* A  " + name);
        // termsImport.push("* Author  Mansouri Amen Allah");
        // codeWriter.writeJavaLine("*/
        // termsAnnotation.push("@Entity\n");
        //termsAnnotation.push('@Table(name="' + name + '")\n');
        for (i = 0, j = elem.tags.length; i < j; i++) {
            if (elem.tags[i].name != "package")
                termsAnnotation.push("@" + elem.tags[i].value);
        }

        ///From generalization 
        var associationGen = Repository.getRelationshipsOf(elem, function (rel) {
            return (rel instanceof type.UMLGeneralization);
        });

        if (associationGen.length > 0) {
            termsClass.push("public " + isAnnotationType + " class  " + name + " ");
            for (k = 0, lenex = associationGen.length; k < lenex; k++) {
                var asso1 = associationGen[k]
                if (asso1.target.isAbstract === true || asso1.target.stereotype === "abstract") {

                    if (elem.name != asso1.target.name) {
                        termsClass.push("extends");
                        termsClass.push(asso1.target.name + " ");
                        for (var j = 0; j < asso1.target.tags.length; j++) {
                            if (asso1.target.tags[j].name === "package") {
                                domain1 = "com.domain." + asso1.target.tags[j].value;
                                if (domain1 != domain)
                                    termsImport.push("import com.domain." + asso1.target.tags[j].value + "." + asso1.target.name + ";\n");
                            }
                        }
                    }
                }

            }
            for (i = 0, len = associationGen.length; i < len; i++) {
                var asso = associationGen[i];

                if (asso.target instanceof type.UMLInterface || asso.target.stereotype === "interface") {
                    for (var j = 0; j < asso.target.tags.length; j++) {
                        if (asso.target.tags[j].name === "package") {
                            var domain1 = "com.domain." + asso1.target.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.target.tags[j].value + "." + asso.target.name + ";\n");
                        }
                    }
                    if (termsClass.indexOf("implements") > -1) {
                        if (elem.name != asso.target.name) {

                            termsClass.push("," + asso.target.name + " ");
                            for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                                if (elem.attributes.indexOf(asso.target.attributes[j]) == -1)
                                    elem.attributes.push(asso.target.attributes[j]);
                            }
                        }

                    } else if (termsClass.indexOf("extends") > -1) {
                        if (elem.name != asso.target.name) {
                            termsClass.push("implements");
                            termsClass.push(asso.target.name + " ");

                            for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                                if (elem.attributes.indexOf(asso.target.attributes[j]) == -1)
                                    elem.attributes.push(asso.target.attributes[j]);
                            }
                        }
                        //termsattribute =asso.target.attributes ; 
                    } else if (elem.name != asso.target.name) {
                        termsClass.push("implements");
                        termsClass.push(asso.target.name);
                        for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                            if (elem.attributes.indexOf(asso.target.attributes[j]) == -1)
                                elem.attributes.push(asso.target.attributes[j]);
                        }

                    }

                }

            }
            /* if (termsClass.indexOf("implements") > -1) {
                 termsClass.push(", Serializable ");
             } else {
                 termsClass.push("implements Serializable ");
             }*/
            termsClass.push("{");


        } else {
            termsClass.push("public " + isAnnotationType + " class " + name + " {");
        }



        var associations1 = Repository.getRelationshipsOf(elem, function (rel1) {
            return (rel1 instanceof type.UMLAssociation);
        });

        console.log('association length: ' + associations1.length);

        for (i = 0, len = associations1.length; i < len; i++) {
            var asso = associations1[i];


            if (asso.end1.multiplicity === "1" && asso.end2.multiplicity === "1") {
                // var id ="id";
                var reference = asso.end2.name.charAt(0).toLowerCase() + asso.end2.name.slice(1);
                var elem1 = asso.end1.name.charAt(0).toLowerCase() + asso.end1.name.slice(1);

                if (asso.end1.navigable === false && asso.end1.reference === elem) {

                    termsAssoation.push("@OneToOne \n")
                    termsAssoation.push('@JsonIgnoreProperties("' + reference + '")\n');
                    termsAssoation.push("private " + asso.end2.reference.name + " " + asso.end2.name + " ;\n");
                    //Setteur
                    termsGetteurSetteur.push("public void set" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                    termsGetteurSetteur.push("this." + asso.end2.name + " = " + asso.end2.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                    //Getteur
                    termsGetteurSetteur.push("public " + asso.end2.reference.name + " get" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                    termsGetteurSetteur.push("return this." + asso.end2.name + " ; \n");
                    termsGetteurSetteur.push("}\n");


                } else if (asso.end2.navigable === true) {
                    termsAssoation.push('@OneToOne(mappedBy="' + reference + '")\n')
                    termsAssoation.push("private " + asso.end1.reference.name + " " + asso.end1.name + " ;\n");
                    //Setteur
                    termsGetteurSetteur.push("public void set" + elem1 + "( " + asso.end1.reference.name + " " + asso.end1.name + " ){\n");
                    termsGetteurSetteur.push("this." + asso.end1.name + " = " + asso.end1.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                    //Getteur
                    termsGetteurSetteur.push("public " + asso.end1.reference.name + " get" + elem1 + " () {\n");
                    termsGetteurSetteur.push("return this." + asso.end1.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                }

            } else {
                if (asso.end1.reference === elem) {

                    for (var j = 0; j < asso.end2.reference.tags.length; j++) {
                        if (asso.end2.reference.tags[j].name === "package") {
                            domain1 = "com.domain." + "." + asso.end2.reference.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.end2.reference.tags[j].value + "." + asso.end2.reference.name + ";\n");
                        }
                    }
                    var reference = asso.end2.name.charAt(0).toLowerCase() + asso.end2.reference.name.slice(1);
                    var elem1 = asso.end1.name.charAt(0).toLowerCase() + asso.end1.name.slice(1);
                    //this.writeAnnotation(codeWriter, asso.end1, asso.end2);
                    if (asso.end2.multiplicity === "0..*" || asso.end2.multiplicity === "1..*") {
                        termsAssoation.push('@OneToMany(mappedBy="' + asso.end1.name + '")\n');
                        //termsAssoation.push("@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)\n")
                        termsAssoation.push("@JsonIgnore\n")
                        if (asso.end2.isOrdered === true) {
                            termsAssoation.push("private List<" + asso.end2.reference.name + ">" + asso.end2.name + "s = new ArrayList<>();\n");//isOrdered List
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "(List<" + asso.end2.reference.name + ">" + " " + asso.end2.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end2.name + "s = " + asso.end2.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public List<" + asso.end2.reference.name + ">" + " get" + reference + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end2.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");

                        }
                        else {
                            termsAssoation.push("private Set<" + asso.end2.reference.name + ">" + asso.end2.name + "s = new HashSet<>();\n");//isOrdered List
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "(Set<" + asso.end2.reference.name + ">" + " " + asso.end2.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end2.name + "s = " + asso.end2.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public Set<" + asso.end2.reference.name + ">" + " get" + reference + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end2.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");
                        }


                    }
                    else if (asso.end2.multiplicity === "0..1" || asso.end2.multiplicity === "1" || asso.end2.multiplicity === "1..1") {
                        termsAssoation.push("@ManyToOne");
                        termsAssoation.push('@JsonIgnoreProperties("' + asso.end1.name + "s" + '")');
                        termsAssoation.push("private " + asso.end2.reference.name + " " + asso.end2.name + " ;");
                        //Setteur
                        termsGetteurSetteur.push("public void set" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                        termsGetteurSetteur.push("this." + asso.end2.name + " = " + asso.end2.name + " ; \n");
                        termsGetteurSetteur.push("}\n");
                        //Getteur
                        termsGetteurSetteur.push("public " + asso.end2.reference.name + " get" + reference + "(){\n");
                        termsGetteurSetteur.push("return this." + asso.end2.name + " ; \n");
                        termsGetteurSetteur.push("}\n");

                    }

                    console.log('assoc end1');
                } 
                if (asso.end2.reference === elem) {
                    // this.writeMemberVariable(codeWriter, asso.end1, options);
                    //this.writeAnnotation(codeWriter, asso.end1, asso.end2);
                    for (var j = 0; j < asso.end1.reference.tags.length; j++) {
                        if (asso.end1.reference.tags[j].name === "package") {
                            domain1 = "com.domain." + asso.end1.reference.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.end1.reference.tags[j].value + "." + asso.end1.reference.name + ";\n");
                        }
                    }
                    var reference = asso.end1.name.charAt(0).toUpperCase() + asso.end1.reference.name.slice(1);
                    var elem2 = asso.end2.name.charAt(0).toUpperCase() + asso.end2.reference.name.slice(1);
                    if (asso.end1.multiplicity === "0..*" || asso.end1.multiplicity === "1..*") {
                        termsAssoation.push('@OneToMany(mappedBy="' + asso.end2.name + '")\n');
                        //  termsAssoation.push("@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)\n")
                        termsAssoation.push("@JsonIgnore\n")
                        if (asso.end1.isOrdered === true) {
                            termsAssoation.push("private List<" + asso.end1.reference.name + ">" + asso.end1.name + "s = new ArrayList<>();\n");
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "(List<" + asso.end1.reference.name + ">" + " " + asso.end1.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end1.name + "s = " + asso.end1.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public List<" + asso.end1.reference.name + ">" + " get" + reference + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end1.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");
                        } else {
                            termsAssoation.push("private Set<" + asso.end1.reference.name + ">" + asso.end1.name + "s = new HashSet<>();\n");
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "(Set<" + asso.end1.reference.name + ">" + " " + asso.end1.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end1.name + "s = " + asso.end1.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public Set<" + asso.end1.reference.name + ">" + " get" + reference + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end1.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");

                        }
                    }
                    else if (asso.end1.multiplicity === "0..1" || asso.end1.multiplicity === "1" || asso.end1.multiplicity === "1..1") {

                        termsAssoation.push("@ManyToOne\n");
                        termsAssoation.push('@JsonIgnoreProperties("' + asso.end2.name + "s" + '")\n')
                        termsAssoation.push("private " + asso.end1.reference.name + " " + asso.end1.name + " ;\n");
                        //Setteur
                        termsGetteurSetteur.push("public void set" + reference + "(" + asso.end1.reference.name + " " + asso.end1.name + "){\n");
                        termsGetteurSetteur.push("this." + asso.end1.name + " = " + asso.end1.name + " ; \n");
                        termsGetteurSetteur.push("}\n");
                        //Getteur
                        termsGetteurSetteur.push("public " + asso.end1.reference.name + " get" + reference + "(){\n");
                        termsGetteurSetteur.push("return this." + asso.end1.name + " ; \n");
                        termsGetteurSetteur.push("}\n");

                    }
                }
            }
            codeWriter.writeJavaLine();
        }





        // Member Variables
        // (from attributes)

        for (i = 0, len = elem.attributes.length; i < len; i++) {
            this.writeMemberVariableJava(codeWriter, elem.attributes[i], termsImport, termsVairiable, domain, options);
            //   codeWriter.writeJavaLine();
        }
        codeWriter.writeJavaLine(termsImport.join(" "));
        codeWriter.writeJavaLine(termsAnnotation.join(""));
        codeWriter.writeJavaLine(termsClass.join(" "));

        codeWriter.writeJavaLine("private static final long serialVersionUID = 1L;");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine("@Id");
        codeWriter.writeJavaLine("@GeneratedValue(strategy = GenerationType.IDENTITY)");
        codeWriter.writeJavaLine("private Long id ;");
        codeWriter.writeJavaLine();

        codeWriter.writeJavaLine(termsVairiable.join(" "));
        codeWriter.writeJavaLine(termsAssoation.join(" "));

        //Constrocteur
        this.WirteConstructorVide(elem);
        codeWriter.writeJavaLine();

        if (associationGen.length > 0) {
            for (i = 0, len = associationGen.length; i < len; i++) {
                var asso = associationGen[i];
                if (asso.target.stereotype === "abstract" && asso.target.name != elem.name) {
                    this.WirteConstructorExtends(elem, asso.target);
                    break
                }
            }
        }

        if (elem.attributes.length > 0) {
            this.WirteConstructor(elem);
            codeWriter.writeJavaLine();
        }
        codeWriter.writeJavaLine("public Long getId(){");
        codeWriter.writeJavaLine("return this.id;\n");
        codeWriter.writeJavaLine("}\n");

        codeWriter.writeJavaLine("public void setId(Long id){");
        codeWriter.writeJavaLine("this.id = id;\n");
        codeWriter.writeJavaLine("}");
        for (i = 0, len = elem.attributes.length; i < len; i++) {
            this.WriteMethodeGetterSetteur(codeWriter, elem, elem.attributes[i], options)
            codeWriter.writeJavaLine();
        }
        codeWriter.writeJavaLine(termsGetteurSetteur.join(" "));

     /*   codeWriter.writeJavaLine("@Override");
        codeWriter.writeJavaLine("public boolean equals(Object o) {");
        codeWriter.writeJavaLine("if(this == o){");
        codeWriter.writeJavaLine("return true;");
        codeWriter.writeJavaLine("}");
        codeWriter.writeJavaLine("if (!(o instanceof " + name + ")) {")
        codeWriter.writeJavaLine("return false;");
        codeWriter.writeJavaLine("}");
        codeWriter.writeJavaLine("return id != null && id.equals(((" + name + ") o).id) ; ");
        codeWriter.writeJavaLine("}");


        codeWriter.writeJavaLine("@Override")
        codeWriter.writeJavaLine("public int hashCode() {");
        codeWriter.writeJavaLine("  return 31 ;");
        codeWriter.writeJavaLine(" } \n");*/

        // this.toString(elem);
        codeWriter.outdent();
        codeWriter.writeJavaLine("}");
    }

    /**
     * write Class Interface
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */

    JdlGenerator.prototype.writeClassInterfaceType = function (codeWriter, elem, domain, options, isAnnotationType) {
        //Class Interface
        var i, j, lenattribute, len, terms = [];
        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
        codeWriter.writeJavaLine("package " + domain + " ;");
        codeWriter.writeJavaLine();

        var associations = Repository.getRelationshipsOf(elem, function (rel) {
            return (rel instanceof type.UMLGeneralization);
        });


        if (associations.length > 0) {
            terms.push("public interface " + name);

            for (i = 0, len = associations.length; i < len; i++) {
                var asso = associations[i];
                if (terms.indexOf("extends") > -1) {
                    if (asso.target.name != elem.name) {
                        terms.push("," + asso.target.name + " ");
                        for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                            if (elem.attributes.indexOf(asso.target.attributes[j]) == -1)
                                elem.attributes.push(asso.target.attributes[j]);
                        }
                    }

                } else if (asso.target.name != elem.name) {
                    terms.push("extends");
                    terms.push(asso.target.name);
                    for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                        if (elem.attributes.indexOf(asso.target.attributes[j]) == -1)
                            elem.attributes.push(asso.target.attributes[j]);
                    }

                }



            }

        } else {
            terms.push("public interface " + name);
        }
        terms.push("{");
        codeWriter.writeJavaLine(terms.join(" "));
        //codeWriter.writeJavaLine();
        //codeWriter.writeJavaLine(termsattribute.join(" "));

        codeWriter.indent();

        for (i = 0, len = elem.attributes.length; i < len; i++) {
            this.writeMemberVariableInterface(codeWriter, elem.attributes[i], options);
            codeWriter.writeJavaLine();
        }

        /*for(i = 0,len =elem.attributes.length; i<len ; i++){
            this.WriteMethodeInterface(codeWriter, elem.attributes[i], options)
            //codeWriter.deleteJavaLines();
    
        }*/
        codeWriter.outdent();
        codeWriter.writeJavaLine("}");
    }
    /**
    * Write Class No Persist
    * @param {StringWriter} codeWriter
    * @param {type.Model} elem
    * @param {Object} options
    */

    JdlGenerator.prototype.writenopersist = function (codeWriter, elem, domain, options) {
        // Class
        var i, j, k, lenex, lenattribute, len, termsClass = [];
        var termsImport = [];
        var termsAnnotation = [];
        var termsAssoation = [];
        var domain1;
        var termsVairiable = [];
        var termsGetteurSetteur = [];

        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);

        termsImport.push("package " + domain + " ;\n");
        //  termsImport.push("import com.fasterxml.jackson.annotation.*;\n");
        // termsImport.push("import org.hibernate.annotations.Cache;\n");
        //termsImport.push("import org.hibernate.annotations.CacheConcurrencyStrategy;\n");
        //  termsImport.push("import javax.persistence.*;\n");
        termsImport.push("import java.io.Serializable;\n");
        termsImport.push("import java.time.LocalDate;\n");
        termsImport.push("import java.util.*;\n");
        //  termsImport.push("/**");
        //  termsImport.push("* A  " + name);
        // termsImport.push("* Author  Mansouri Amen Allah");
        // codeWriter.writeJavaLine("*/
        //termsAnnotation.push("@Entity\n");
        // termsAnnotation.push('@Table(name="' + name + '")\n');
        for (i = 0, j = elem.tags.length; i < j; i++) {
            if (elem.tags[i].name != "package")
                termsAnnotation.push("@" + elem.tags[i].value);
        }

        ///From generalization 
        var associationGen = Repository.getRelationshipsOf(elem, function (rel) {
            return (rel instanceof type.UMLGeneralization);
        });

        if (associationGen.length > 0) {
            termsClass.push("public class  " + name + " ");
            for (k = 0, lenex = associationGen.length; k < lenex; k++) {
                var asso1 = associationGen[k]
                if (asso1.target.isAbstract === true || asso1.target.stereotype === "abstract") {

                    if (elem.name != asso1.target.name) {
                        termsClass.push("extends");
                        termsClass.push(asso1.target.name + " ");
                        for (var j = 0; j < asso1.target.tags.length; j++) {
                            if (asso1.target.tags[j].name === "package") {
                                domain1 = "com.domain." + asso1.target.tags[j].value;
                                if (domain1 != domain)
                                    termsImport.push("import com.domain." + asso1.target.tags[j].value + "." + asso1.target.name + ";\n");
                            }
                        }
                    }
                }

            }
            for (i = 0, len = associationGen.length; i < len; i++) {
                var asso = associationGen[i];

                if (asso.target instanceof type.UMLInterface || asso.target.stereotype === "interface") {
                    for (var j = 0; j < asso.target.tags.length; j++) {
                        if (asso.target.tags[j].name === "package") {
                            var domain1 = "com.domain." + asso1.target.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.target.tags[j].value + "." + asso.target.name + ";\n");
                        }
                    }
                    if (termsClass.indexOf("implements") > -1) {
                        if (elem.name != asso.target.name) {

                            termsClass.push("," + asso.target.name + " ");
                            for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                                if (elem.attributes.indexOf(asso.target.attributes[j]) == -1)
                                    elem.attributes.push(asso.target.attributes[j]);
                            }
                        }

                    } else if (termsClass.indexOf("extends") > -1) {
                        if (elem.name != asso.target.name) {
                            termsClass.push("implements");
                            termsClass.push(asso.target.name + " ");

                            for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                                if (elem.attributes.indexOf(asso.target.attributes[j]) == -1)
                                    elem.attributes.push(asso.target.attributes[j]);
                            }
                        }
                        //termsattribute =asso.target.attributes ; 
                    } else if (elem.name != asso.target.name) {
                        termsClass.push("implements");
                        termsClass.push(asso.target.name);
                        for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                            if (elem.attributes.indexOf(asso.target.attributes[j]) == -1)
                                elem.attributes.push(asso.target.attributes[j]);
                        }

                    }

                }

            }
            /* if (termsClass.indexOf("implements") > -1) {
                 termsClass.push(", Serializable ");
             } else {
                 termsClass.push("implements Serializable ");
             }*/
            termsClass.push("{");


        } else {
            termsClass.push("public class  " + name + "  {");
        }



        var associations1 = Repository.getRelationshipsOf(elem, function (rel1) {
            return (rel1 instanceof type.UMLAssociation);
        });

        console.log('association length: ' + associations1.length);

        for (i = 0, len = associations1.length; i < len; i++) {
            var asso = associations1[i];


            if (asso.end1.multiplicity === "1" && asso.end2.multiplicity === "1") {
                // var id ="id";
                var reference = asso.end2.name.charAt(0).toUpperCase() + asso.end2.name.slice(1);
                var elem1 = asso.end1.name.charAt(0).toUpperCase() + asso.end1.name.slice(1);

                if (asso.end1.navigable === false && asso.end1.reference === elem) {

                    // termsAssoation.push("@OneToOne \n")
                    //termsAssoation.push('@JsonIgnoreProperties("' + reference + '")\n');
                    termsAssoation.push("private " + asso.end2.reference.name + " " + asso.end2.name + " ;\n");
                    //Setteur
                    termsGetteurSetteur.push("public void set" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                    termsGetteurSetteur.push("this." + asso.end2.name + " = " + asso.end2.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                    //Getteur
                    termsGetteurSetteur.push("public " + asso.end2.reference.name + " get" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                    termsGetteurSetteur.push("return this." + asso.end2.name + " ; \n");
                    termsGetteurSetteur.push("}\n");


                } else if (asso.end2.navigable === true) {
                    // termsAssoation.push('@OneToOne(mappedBy="' + reference + '")\n')
                    termsAssoation.push("private " + asso.end1.reference.name + " " + asso.end1.name + " ;\n");
                    //Setteur
                    termsGetteurSetteur.push("public void set" + elem1 + "( " + asso.end1.reference.name + " " + asso.end1.name + " ){\n");
                    termsGetteurSetteur.push("this." + asso.end1.name + " = " + asso.end1.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                    //Getteur
                    termsGetteurSetteur.push("public " + asso.end1.reference.name + " get" + elem1 + " () {\n");
                    termsGetteurSetteur.push("return this." + asso.end1.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                }

            } else {
                if (asso.end1.reference === elem) {

                    for (var j = 0; j < asso.end2.reference.tags.length; j++) {
                        if (asso.end2.reference.tags[j].name === "package") {
                            domain1 = "com.domain." + "." + asso.end2.reference.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.end2.reference.tags[j].value + "." + asso.end2.reference.name + ";\n");
                        }
                    }
                    var reference = asso.end2.name.charAt(0).toUpperCase() + asso.end2.name.slice(1);
                    var elem1 = asso.end1.name.charAt(0).toLowerCase() + asso.end1.name.slice(1);
                    //this.writeAnnotation(codeWriter, asso.end1, asso.end2);
                    if (asso.end2.multiplicity === "0..*" || asso.end2.multiplicity === "1..*") {
                        //termsAssoation.push('@OneToMany(mappedBy="' + asso.end1.name + '")\n');
                        // termsAssoation.push("@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)\n")
                        //termsAssoation.push("@JsonIgnore\n")
                        if (asso.end2.isOrdered === true) {
                            termsAssoation.push("private List<" + asso.end2.reference.name + ">" + asso.end2.name + "s = new ArrayList<>();\n");//isOrdered List
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "s " + "(List<" + asso.end2.reference.name + ">" + " " + asso.end2.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end2.name + "s = " + asso.end2.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public List<" + asso.end2.reference.name + ">" + " get" + reference + "s " + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end2.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");

                        }
                        else {
                            termsAssoation.push("private Set<" + asso.end2.reference.name + ">" + asso.end2.name + "s = new HashSet<>();\n");//isOrdered List
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "s (Set<" + asso.end2.reference.name + ">" + " " + asso.end2.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end2.name + "s = " + asso.end2.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public Set<" + asso.end2.reference.name + ">" + " get" + reference + "s (){\n");
                            termsGetteurSetteur.push("return this." + asso.end2.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");
                        }


                    }
                    else if (asso.end2.multiplicity === "0..1" || asso.end2.multiplicity === "1" || asso.end2.multiplicity === "1..1") {
                        //termsAssoation.push("@ManyToOne");
                        //termsAssoation.push('@JsonIgnoreProperties("' + asso.end1.name + "s" + '")');
                        termsAssoation.push("private " + asso.end2.reference.name + " " + asso.end2.name + " ;");
                        //Setteur
                        termsGetteurSetteur.push("public void set" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                        termsGetteurSetteur.push("this." + asso.end2.name + " = " + asso.end2.name + " ; \n");
                        termsGetteurSetteur.push("}\n");
                        //Getteur
                        termsGetteurSetteur.push("public " + asso.end2.reference.name + " get" + reference + "(){\n");
                        termsGetteurSetteur.push("return this." + asso.end2.name + " ; \n");
                        termsGetteurSetteur.push("}\n");

                    }

                    console.log('assoc end1');
                }
                if (asso.end2.reference === elem) {
                    // this.writeMemberVariable(codeWriter, asso.end1, options);
                    //this.writeAnnotation(codeWriter, asso.end1, asso.end2);
                    for (var j = 0; j < asso.end1.reference.tags.length; j++) {
                        if (asso.end1.reference.tags[j].name === "package") {
                            domain1 = "com.domain." + asso.end1.reference.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.end1.reference.tags[j].value + "." + asso.end1.reference.name + ";\n");
                        }
                    }
                    var reference = asso.end1.name.charAt(0).toUpperCase() + asso.end1.name.slice(1);
                    var elem2 = asso.end2.name.charAt(0).toUpperCase() + asso.end2.reference.name.slice(1);
                    if (asso.end1.multiplicity === "0..*" || asso.end1.multiplicity === "1..*") {
                        // termsAssoation.push('@OneToMany(mappedBy="' + asso.end2.name + '")\n');
                        // termsAssoation.push("@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)\n")
                        //termsAssoation.push("@JsonIgnore\n")
                        if (asso.end1.isOrdered === true) {
                            termsAssoation.push("private List<" + asso.end1.reference.name + ">" + asso.end1.name + "s = new ArrayList<>();\n");
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "s " + "(List<" + asso.end1.reference.name + ">" + " " + asso.end1.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end1.name + "s = " + asso.end1.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public List<" + asso.end1.reference.name + ">" + " get" + reference + "s " + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end1.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");
                        } else {
                            termsAssoation.push("private Set<" + asso.end1.reference.name + ">" + asso.end1.name + "s = new HashSet<>();\n");
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "s " + "(Set<" + asso.end1.reference.name + ">" + " " + asso.end1.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end1.name + "s = " + asso.end1.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public Set<" + asso.end1.reference.name + ">" + " get" + reference + "s " + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end1.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");

                        }
                    }
                    else if (asso.end1.multiplicity === "0..1" || asso.end1.multiplicity === "1" || asso.end1.multiplicity === "1..1") {


                        termsAssoation.push("private " + asso.end1.reference.name + " " + asso.end1.name + " ;\n");
                        //Setteur
                        termsGetteurSetteur.push("public void set" + reference + "(" + asso.end1.reference.name + " " + asso.end1.name + "){\n");
                        termsGetteurSetteur.push("this." + asso.end1.name + " = " + asso.end1.name + " ; \n");
                        termsGetteurSetteur.push("}\n");
                        //Getteur
                        termsGetteurSetteur.push("public " + asso.end1.reference.name + " get" + reference + "(){\n");
                        termsGetteurSetteur.push("return this." + asso.end1.name + " ; \n");
                        termsGetteurSetteur.push("}\n");

                    }
                }
            }
            codeWriter.writeJavaLine();
        }

        for (i = 0, len = elem.attributes.length; i < len; i++) {
            this.writeMemberVariableJavanoPersist(codeWriter, elem.attributes[i], termsImport, termsVairiable, domain, options);
            //   codeWriter.writeJavaLine();
        }
        codeWriter.writeJavaLine(termsImport.join(" "));
        codeWriter.writeJavaLine(termsAnnotation.join(""));
        codeWriter.writeJavaLine(termsClass.join(" "));


        codeWriter.writeJavaLine(termsVairiable.join(" "));
        codeWriter.writeJavaLine(termsAssoation.join(" "));
        //Constrocteur
        this.WirteConstructorVide(elem);
        codeWriter.writeJavaLine();

        if (associationGen.length > 0) {
            for (i = 0, len = associationGen.length; i < len; i++) {
                var asso = associationGen[i];
                if (asso.target.stereotype === "abstract") {
                    this.WirteConstructorExtends(elem, asso.target);
                    break
                }
            }
        }

        if (elem.attributes.length > 0) {
            this.WirteConstructor(elem);
            codeWriter.writeJavaLine();
        }

        for (i = 0, len = elem.attributes.length; i < len; i++) {
            this.WriteMethodeGetterSetteur(codeWriter, elem, elem.attributes[i], options)
            codeWriter.writeJavaLine();
        }
        codeWriter.writeJavaLine(termsGetteurSetteur.join(" "));


        //this.toString(elem);
        codeWriter.outdent();
        codeWriter.writeJavaLine("}");


    }
/**
     * Write Class RestController
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    JdlGenerator.prototype.writeClassRest = function(codeWriter, elem, domain,service  ,controller , options){
        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
        var name1 = elem.name.charAt(0).toLowerCase() + elem.name.slice(1);
        var mapping ="/"+name1+"s";
        var Getmapping = "/"+name1+"s"+"/{id}";
        codeWriter.writeJavaLine("package "+ rest +"; ");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine("import "+domain+"."+name+";");
        codeWriter.writeJavaLine("import "+service+"."+name+"Service;");
        codeWriter.writeJavaLine("import org.springframework.web.bind.annotation.RestController;");
        codeWriter.writeJavaLine("import org.springframework.beans.factory.annotation.Autowired;");
        codeWriter.writeJavaLine("import org.springframework.web.bind.annotation.PostMapping;");
        codeWriter.writeJavaLine("import org.springframework.web.bind.annotation.GetMapping;");
        codeWriter.writeJavaLine("import org.springframework.web.bind.annotation.DeleteMapping;");
        codeWriter.writeJavaLine("import org.springframework.web.bind.annotation.PutMapping;");
        codeWriter.writeJavaLine("import org.springframework.web.bind.annotation.RequestBody;");
        codeWriter.writeJavaLine("import org.springframework.web.bind.annotation.PathVariable;");
        codeWriter.writeJavaLine("import java.util.Optional;");
        codeWriter.writeJavaLine("import java.util.List;");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine("@RestController")
        codeWriter.writeJavaLine("public class "+name+"Controller {");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine("      @Autowired")
        codeWriter.writeJavaLine("       private "+name+"Service"+" "+name1+"Service ;");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine('      @PostMapping(value ="' + mapping + '")');
        codeWriter.writeJavaLine("      public void save(@RequestBody "+name+" "+name1+") {");
        codeWriter.writeJavaLine("          "+name1+"Service.saveOrUpdate("+name1+");");
        codeWriter.writeJavaLine("}");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine('      @PutMapping(value ="' + mapping + '")');
        codeWriter.writeJavaLine("      public void update(@RequestBody "+name+" "+name1+") {");
        codeWriter.writeJavaLine("          "+name1+"Service.saveOrUpdate("+name1+");")
        codeWriter.writeJavaLine("}")
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine('      @DeleteMapping(value ="' + Getmapping + '")');
        codeWriter.writeJavaLine("      public void delete(@PathVariable Long id) {");
        codeWriter.writeJavaLine("          "+name1+"Service.deleteById(id);")
        codeWriter.writeJavaLine("}")
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine('      @GetMapping(value ="' + Getmapping + '")');
        codeWriter.writeJavaLine("      public Optional<"+name+">  findById(@PathVariable Long id) {");
        codeWriter.writeJavaLine("          return "+name1+"Service.findById(id);")
        codeWriter.writeJavaLine("}")
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine('      @GetMapping(value ="' + mapping + '")');
        codeWriter.writeJavaLine("      public List<"+name+">  findAll() {");
        codeWriter.writeJavaLine("         return "+name1+"Service.findAll();")
        codeWriter.writeJavaLine("}")
        codeWriter.writeJavaLine("}");
    }
     /**
     * Write Class ServiceImpl
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
JdlGenerator.prototype.writeClassServiceImpl= function(codeWriter, elem, domain, service,serviceImpl ,repository ,  options){
    var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
    var variable = elem.name.charAt(0).toLowerCase() + elem.name.slice(1);
    codeWriter.writeJavaLine("package "+ serviceImpl +"; ");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("import "+domain+"."+name+";");
    codeWriter.writeJavaLine("import "+service+"."+name+"Service;");
    codeWriter.writeJavaLine("import "+repository+"."+name+"Repository;");
    codeWriter.writeJavaLine("import org.springframework.stereotype.Service;") ;
    codeWriter.writeJavaLine("import java.util.Optional;");
    codeWriter.writeJavaLine("import java.util.List;");
    codeWriter.writeJavaLine("import org.springframework.beans.factory.annotation.Autowired;");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("@Service")
    codeWriter.writeJavaLine("public class "+name+"ServiceImpl implements "+ name+"Service {");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("   @Autowired")
    codeWriter.writeJavaLine("      private "+name+"Repository "+ variable+"Repository ;");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("   @Override");
    codeWriter.writeJavaLine("     public void saveOrUpdate("+name+" "+ variable+"){");
    codeWriter.writeJavaLine("          "+ variable+"Repository.save("+variable+");");
    codeWriter.writeJavaLine("      }");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("   @Override");
    codeWriter.writeJavaLine("     public void deleteById(Long id){");
    codeWriter.writeJavaLine("          "+ variable+"Repository.deleteById(id);");
    codeWriter.writeJavaLine("      }");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("   @Override");
    codeWriter.writeJavaLine("     public Optional<"+name+"> findById(Long id){");
    codeWriter.writeJavaLine("          return "+ variable+"Repository.findById(id);");
    codeWriter.writeJavaLine("}");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("   @Override");
    codeWriter.writeJavaLine("      public List<"+name+"> findAll(){");
    codeWriter.writeJavaLine("           return "+ variable+"Repository.findAll();");
    codeWriter.writeJavaLine("}")
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("}");
}
    /**
     * Write Class Service
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
JdlGenerator.prototype.writeClassService= function(codeWriter, elem, domain, service,  options){
    var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
    var variable = elem.name.charAt(0).toLowerCase() + elem.name.slice(1);
    codeWriter.writeJavaLine("package "+ service+"; ");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("import "+domain+"."+name+";");
    codeWriter.writeJavaLine("import java.util.Optional;");
    codeWriter.writeJavaLine("import java.util.List;");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("public interface "+name+"Service{");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("      void saveOrUpdate("+name+" "+ variable+");");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("      void deleteById(Long id ) ;");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("      Optional<"+name+"> findById(Long id);");
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("      List<"+name+"> findAll();") ;
    codeWriter.writeJavaLine();
    codeWriter.writeJavaLine("}");
}
    /**
     * Write Class Repository
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    JdlGenerator.prototype.writeClassRepository = function (codeWriter, elem, domain, repository, options) {
        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);

        codeWriter.writeJavaLine("package "+ repository+"; ");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine("import org.springframework.data.jpa.repository.JpaRepository;")
        codeWriter.writeJavaLine("import org.springframework.stereotype.Repository;");
        codeWriter.writeJavaLine("import "+domain+"."+name+";");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine("@Repository")
        codeWriter.writeJavaLine("public interface "+name+"Repository extends JpaRepository<"+name+",Long>{");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine("}");
    }
    /**
     * Write Class JPA
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    JdlGenerator.prototype.writeClass = function (codeWriter, elem, domain, options) {

        // Class
        var i, j, k, lenex, lenattribute, len, termsClass = [];
        var termsImport = [];
        var termsAnnotation = [];
        var termsAssoation = [];
        var domain1;
        var termsVairiable = [];
        var termsGetteurSetteur = [];

        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);

        termsImport.push("package " + domain + " ;\n");
        termsImport.push("import com.fasterxml.jackson.annotation.*;\n");
        // termsImport.push("import org.hibernate.annotations.Cache;\n");
        //termsImport.push("import org.hibernate.annotations.CacheConcurrencyStrategy;\n");
        termsImport.push("import javax.persistence.*;\n");
        termsImport.push("import java.io.Serializable;\n");
        termsImport.push("import java.time.LocalDate;\n");
        termsImport.push("import java.util.*;\n");
        //  termsImport.push("/**");
        //  termsImport.push("* A  " + name);
        // termsImport.push("* Author  Mansouri Amen Allah");
        // codeWriter.writeJavaLine("*/
        termsAnnotation.push("@Entity\n");
        termsAnnotation.push('@Table(name="' + name + '")\n');
        for (i = 0, j = elem.tags.length; i < j; i++) {
            if (elem.tags[i].name != "package")
                termsAnnotation.push("@" + elem.tags[i].value);
        }

        ///From generalization 
        var associationGen = Repository.getRelationshipsOf(elem, function (rel) {
            return (rel instanceof type.UMLGeneralization);
        });

        if (associationGen.length > 0) {
            termsClass.push("public class  " + name + " ");
            for (k = 0, lenex = associationGen.length; k < lenex; k++) {
                var asso1 = associationGen[k]
                if (asso1.target.isAbstract === true || asso1.target.stereotype === "abstract") {

                    if (elem.name != asso1.target.name) {
                        termsClass.push("extends");
                        termsClass.push(asso1.target.name + " ");
                        for (var j = 0; j < asso1.target.tags.length; j++) {
                            if (asso1.target.tags[j].name === "package") {
                                domain1 = "com.domain." + asso1.target.tags[j].value;
                                if (domain1 != domain)
                                    termsImport.push("import com.domain." + asso1.target.tags[j].value + "." + asso1.target.name + ";\n");
                            }
                        }
                    }
                }

            }
            for (i = 0, len = associationGen.length; i < len; i++) {
                var asso = associationGen[i];

                if (asso.target instanceof type.UMLInterface || asso.target.stereotype === "interface") {
                    for (var j = 0; j < asso.target.tags.length; j++) {
                        if (asso.target.tags[j].name === "package") {
                            var domain1 = "com.domain." + asso1.target.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.target.tags[j].value + "." + asso.target.name + ";\n");
                        }
                    }
                    if (termsClass.indexOf("implements") > -1) {
                        if (elem.name != asso.target.name) {

                            termsClass.push("," + asso.target.name + " ");
                            for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                                if (elem.attributes.indexOf(asso.target.attributes[j].name) === -1)
                                    elem.attributes.push(asso.target.attributes[j]);
                            }
                        }

                    } else if (termsClass.indexOf("extends") > -1) {
                        if (elem.name != asso.target.name) {
                            termsClass.push("implements");
                            termsClass.push(asso.target.name + " ");

                            for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                                if (elem.attributes.indexOf(asso.target.attributes[j]) === -1)
                                    elem.attributes.push(asso.target.attributes[j]);
                            }
                        }
                        //termsattribute =asso.target.attributes ; 
                    } else if (elem.name != asso.target.name) {
                        termsClass.push("implements");
                        termsClass.push(asso.target.name);
                        for (j = 0, lenattribute = asso.target.attributes.length; j < lenattribute; j++) {
                            if (elem.attributes.indexOf(asso.target.attributes[j]) === -1)
                                elem.attributes.push(asso.target.attributes[j]);
                        }

                    }

                }

            }
            if (termsClass.indexOf("implements") > -1) {
                termsClass.push(", Serializable ");
            } else {
                termsClass.push("implements Serializable ");
            }
            termsClass.push("{");


        } else {
            termsClass.push("public class  " + name + " implements Serializable {");
        }



        var associations1 = Repository.getRelationshipsOf(elem, function (rel1) {
            return (rel1 instanceof type.UMLAssociation);
        });

        console.log('association length: ' + associations1.length);

        for (i = 0, len = associations1.length; i < len; i++) {
            var asso = associations1[i];


            if (asso.end1.multiplicity === "1" && asso.end2.multiplicity === "1") {
                // var id ="id";
                var ref = asso.end2.name.charAt(0).toLowerCase() + asso.end2.name.slice(1);
                var reference = asso.end2.name.charAt(0).toUpperCase() + asso.end2.name.slice(1);
                var elem1 = asso.end1.name.charAt(0).toUpperCase() + asso.end1.name.slice(1);

                if (asso.end1.navigable === false && asso.end1.reference === elem) {

                    termsAssoation.push("@OneToOne \n")
                    termsAssoation.push('@JsonIgnoreProperties("' + ref + '")\n');
                    termsAssoation.push("private " + asso.end2.reference.name + " " + asso.end2.name + " ;\n");
                    //Setteur
                    termsGetteurSetteur.push("public void set" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                    termsGetteurSetteur.push("this." + asso.end2.name + " = " + asso.end2.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                    //Getteur
                    termsGetteurSetteur.push("public " + asso.end2.reference.name + " get" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                    termsGetteurSetteur.push("return this." + asso.end2.name + " ; \n");
                    termsGetteurSetteur.push("}\n");


                } else if (asso.end2.navigable === true) {
                    termsAssoation.push('@OneToOne(mappedBy="' + ref + '")\n')
                    termsAssoation.push("private " + asso.end1.reference.name + " " + asso.end1.name + " ;\n");
                    //Setteur
                    termsGetteurSetteur.push("public void set" + elem1 + "( " + asso.end1.reference.name + " " + asso.end1.name + " ){\n");
                    termsGetteurSetteur.push("this." + asso.end1.name + " = " + asso.end1.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                    //Getteur
                    termsGetteurSetteur.push("public " + asso.end1.reference.name + " get" + elem1 + " () {\n");
                    termsGetteurSetteur.push("return this." + asso.end1.name + " ; \n");
                    termsGetteurSetteur.push("}\n");
                }

            } else {
                if (asso.end1.reference === elem) {

                    for (var j = 0; j < asso.end2.reference.tags.length; j++) {
                        if (asso.end2.reference.tags[j].name === "package") {
                            domain1 = "com.domain." + "." + asso.end2.reference.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.end2.reference.tags[j].value + "." + asso.end2.reference.name + ";\n");
                        }
                    }
                    var reference = asso.end2.name.charAt(0).toUpperCase() + asso.end2.name.slice(1);
                    var elem1 = asso.end1.name.charAt(0).toLowerCase() + asso.end1.name.slice(1);
                    //this.writeAnnotation(codeWriter, asso.end1, asso.end2);
                    if (asso.end2.multiplicity === "0..*" || asso.end2.multiplicity === "1..*") {
                        termsAssoation.push('@OneToMany(mappedBy="' + asso.end1.name + '")\n');
                        // termsAssoation.push("@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)\n")
                        termsAssoation.push("@JsonIgnore\n")
                        if (asso.end2.isOrdered === true) {
                            termsAssoation.push("private List<" + asso.end2.reference.name + ">" + asso.end2.name + "s = new ArrayList<>();\n");//isOrdered List
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "s " + "(List<" + asso.end2.reference.name + ">" + " " + asso.end2.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end2.name + "s = " + asso.end2.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public List<" + asso.end2.reference.name + ">" + " get" + reference + "s " + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end2.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");

                        }
                        else {
                            termsAssoation.push("private Set<" + asso.end2.reference.name + ">" + asso.end2.name + "s = new HashSet<>();\n");//isOrdered List
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "s (Set<" + asso.end2.reference.name + ">" + " " + asso.end2.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end2.name + "s = " + asso.end2.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public Set<" + asso.end2.reference.name + ">" + " get" + reference + "s (){\n");
                            termsGetteurSetteur.push("return this." + asso.end2.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");
                        }


                    }
                    else if (asso.end2.multiplicity === "0..1" || asso.end2.multiplicity === "1" || asso.end2.multiplicity === "1..1") {
                        termsAssoation.push("@ManyToOne");
                        termsAssoation.push('@JsonIgnoreProperties("' + asso.end1.name + "s" + '")');
                        termsAssoation.push("private " + asso.end2.reference.name + " " + asso.end2.name + " ;");
                        //Setteur
                        termsGetteurSetteur.push("public void set" + reference + "(" + asso.end2.reference.name + " " + asso.end2.name + "){\n");
                        termsGetteurSetteur.push("this." + asso.end2.name + " = " + asso.end2.name + " ; \n");
                        termsGetteurSetteur.push("}\n");
                        //Getteur
                        termsGetteurSetteur.push("public " + asso.end2.reference.name + " get" + reference + "(){\n");
                        termsGetteurSetteur.push("return this." + asso.end2.name + " ; \n");
                        termsGetteurSetteur.push("}\n");

                    }

                    console.log('assoc end1');
                } 
                if (asso.end2.reference === elem) {
                    // this.writeMemberVariable(codeWriter, asso.end1, options);
                    //this.writeAnnotation(codeWriter, asso.end1, asso.end2);
                    for (var j = 0; j < asso.end1.reference.tags.length; j++) {
                        if (asso.end1.reference.tags[j].name === "package") {
                            domain1 = "com.domain." + asso.end1.reference.tags[j].value;
                            if (domain1 != domain)
                                termsImport.push("import com.domain." + asso.end1.reference.tags[j].value + "." + asso.end1.reference.name + ";\n");
                        }
                    }
                    var reference = asso.end1.name.charAt(0).toUpperCase() + asso.end1.name.slice(1);
                    var elem2 = asso.end2.name.charAt(0).toUpperCase() + asso.end2.reference.name.slice(1);
                    if (asso.end1.multiplicity === "0..*" || asso.end1.multiplicity === "1..*") {
                        termsAssoation.push('@OneToMany(mappedBy="' + asso.end2.name + '")\n');
                        // termsAssoation.push("@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)\n")
                        termsAssoation.push("@JsonIgnore\n")
                        if (asso.end1.isOrdered === true) {
                            termsAssoation.push("private List<" + asso.end1.reference.name + ">" + asso.end1.name + "s = new ArrayList<>();\n");
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "s " + "(List<" + asso.end1.reference.name + ">" + " " + asso.end1.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end1.name + "s = " + asso.end1.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public List<" + asso.end1.reference.name + ">" + " get" + reference + "s " + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end1.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");
                        } else {
                            termsAssoation.push("private Set<" + asso.end1.reference.name + ">" + asso.end1.name + "s = new HashSet<>();\n");
                            //Setteur
                            termsGetteurSetteur.push("public void set" + reference + "s " + "(Set<" + asso.end1.reference.name + ">" + " " + asso.end1.name + "){\n");
                            termsGetteurSetteur.push("this." + asso.end1.name + "s = " + asso.end1.name + " ; \n");
                            termsGetteurSetteur.push("}\n");
                            //Getteur
                            termsGetteurSetteur.push("public Set<" + asso.end1.reference.name + ">" + " get" + reference + "s " + "(){\n");
                            termsGetteurSetteur.push("return this." + asso.end1.name + "s  ; \n");
                            termsGetteurSetteur.push("}\n");

                        }
                    }
                    else if (asso.end1.multiplicity === "0..1" || asso.end1.multiplicity === "1" || asso.end1.multiplicity === "1..1") {

                        termsAssoation.push("@ManyToOne\n");
                        termsAssoation.push('@JsonIgnoreProperties("' + asso.end2.name + "s" + '")\n')
                        termsAssoation.push("private " + asso.end1.reference.name + " " + asso.end1.name + " ;\n");
                        //Setteur
                        termsGetteurSetteur.push("public void set" + reference + "(" + asso.end1.reference.name + " " + asso.end1.name + "){\n");
                        termsGetteurSetteur.push("this." + asso.end1.name + " = " + asso.end1.name + " ; \n");
                        termsGetteurSetteur.push("}\n");
                        //Getteur
                        termsGetteurSetteur.push("public " + asso.end1.reference.name + " get" + reference + "(){\n");
                        termsGetteurSetteur.push("return this." + asso.end1.name + " ; \n");
                        termsGetteurSetteur.push("}\n");

                    }
                }
            }
            codeWriter.writeJavaLine();
        }

        for (i = 0, len = elem.attributes.length; i < len; i++) {
            this.writeMemberVariableJava(codeWriter, elem.attributes[i], termsImport, termsVairiable, domain, options);
            //   codeWriter.writeJavaLine();
        }
        codeWriter.writeJavaLine(termsImport.join(" "));
        codeWriter.writeJavaLine(termsAnnotation.join(""));
        codeWriter.writeJavaLine(termsClass.join(" "));

        codeWriter.writeJavaLine("private static final long serialVersionUID = 1L;");
        codeWriter.writeJavaLine();
        codeWriter.writeJavaLine("@Id");
        codeWriter.writeJavaLine("@GeneratedValue(strategy = GenerationType.IDENTITY)");
        codeWriter.writeJavaLine("private Long id ;");
        codeWriter.writeJavaLine();

        codeWriter.writeJavaLine(termsVairiable.join(" "));
        codeWriter.writeJavaLine(termsAssoation.join(" "));
        //Constrocteur
        this.WirteConstructorVide(elem);
        codeWriter.writeJavaLine();

        if (associationGen.length > 0) {
            for (i = 0, len = associationGen.length; i < len; i++) {
                var asso = associationGen[i];
                if (asso.target.stereotype === "abstract") {
                    this.WirteConstructorExtends(elem, asso.target);
                    break
                }
            }
        }

        if (elem.attributes.length > 0) {
            this.WirteConstructor(elem);
            codeWriter.writeJavaLine();
        }
        codeWriter.writeJavaLine("public Long getId(){");
        codeWriter.writeJavaLine("return this.id;\n");
        codeWriter.writeJavaLine("}\n");

        codeWriter.writeJavaLine("public void setId(Long id){");
        codeWriter.writeJavaLine("this.id = id;\n");
        codeWriter.writeJavaLine("}");
        for (i = 0, len = elem.attributes.length; i < len; i++) {
            this.WriteMethodeGetterSetteur(codeWriter, elem, elem.attributes[i], options)
            codeWriter.writeJavaLine();
        }
        codeWriter.writeJavaLine(termsGetteurSetteur.join(" "));

       /* codeWriter.writeJavaLine("@Override");
        codeWriter.writeJavaLine("public boolean equals(Object o) {");
        codeWriter.writeJavaLine("if(this == o){");
        codeWriter.writeJavaLine("return true;");
        codeWriter.writeJavaLine("}");
        codeWriter.writeJavaLine("if (!(o instanceof " + name + ")) {")
        codeWriter.writeJavaLine("return false;");
        codeWriter.writeJavaLine("}");
        codeWriter.writeJavaLine("return id != null && id.equals(((" + name + ") o).id) ; ");
        codeWriter.writeJavaLine("}");


        codeWriter.writeJavaLine("@Override")
        codeWriter.writeJavaLine("public int hashCode() {");
        codeWriter.writeJavaLine("  return 31 ;");
        codeWriter.writeJavaLine(" } \n");*/

        //this.toString(elem);
        codeWriter.outdent();
        codeWriter.writeJavaLine("}");




    };
    /**
     * Fonction toString
     * 
     */

    JdlGenerator.prototype.toString = function (elem) {
        var i, len, terms = [];
        var s = "=";
        var a = "+";
        var ko = " {";
        var f = "}";
        var v = ",";
        var pv = " ; ";
        var id = "id= ";
        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
        codeWriter.writeJavaLine("@Override");
        codeWriter.writeJavaLine("public String toString() {");
        terms.push(' return "' + name + ko + '" ' + a + "\n");
        terms.push('"' + id + '"' + " + " + "id" + "+ \n");

        for (i = 0, len = elem.attributes.length; i < len; i++) {
            terms.push('"' + v + elem.attributes[i].name + s + '"' + " + " + elem.attributes[i].name + "+ \n");
        }
        terms.push('"' + f + '"' + pv);
        terms.push("\n}");
        codeWriter.writeJavaLine(terms.join(" "));
    }
    /**
     * Return type expression
     * @param {type.Model} elem
     * @return {string}
     */
    JdlGenerator.prototype.getType = function (elem) {
        var allowedTypes = ["Integer", "Long", "Float", "Double", "BigDecimal", "LocalDate", "ZonedDateTime", "Boolean", "enum", "byte[]"];
        var _type = "String";
        // type name
        if (elem instanceof type.UMLAssociationEnd) {
            if (elem.reference instanceof type.UMLModelElement && elem.reference.name.length > 0) {
                _type = elem.reference.name;
            }
        } else {
            if (elem.type instanceof type.UMLModelElement && elem.type.name.length > 0) {
                _type = elem.type.name;
            } else if (_.isString(elem.type) && elem.type.length > 0) {
                _type = elem.type;
            }
        }
        return _type;
    };

    /*    /**
     * Write Member Variable
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */

    JdlGenerator.prototype.writeMemberVariableInterface = function (codeWriter, elem, options) {
        if (elem.name.length > 0) {
            var terms = [];

            // type
            terms.push(this.getType(elem));

            // name
            if (this.getType(elem) != "String") {
                terms.push(elem.name);
                terms.push("= " + elem.defaultValue);
            } else {
                terms.push(elem.name);
                terms.push("= " + '"' + elem.name + '"');
            }


            //  codeWriter.writeLine(this.getType(elem))

            // TODO - Add options here

            codeWriter.writeJavaLine(terms.join(" ") + ";");
        }
    };

    /**
     * Write Member Variable Java
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    JdlGenerator.prototype.writeMemberVariableJavanoPersist = function (codeWriter, elem, termsImport, termsVairiable, domain, options) {
        if (elem.name.length > 0) {
            var terms = [];
            //annotationJPA
            var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
            //str1.concat(' ', name);
            if (elem.type != "Long" && elem.type != "String" && elem.type != "Integer" && elem.type != "LocalDate" && elem.type != "Double" && elem.type != "Boolean") {
                for (var j = 0; j < elem.type.tags.length; j++) {
                    var domaine = "com.domain." + elem.type.tags[j].value;
                    if (elem.type.tags[j].name === "package" && domaine != domain) {
                        termsImport.push("import com.domain." + elem.type.tags[j].value + "." + elem.type.name + " ;\n");
                    }
                }
            }
            termsVairiable.push("    private" + " " + this.getType(elem));
            termsVairiable.push(elem.name + "; \n");

            //  codeWriter.writeLine(this.getType(elem))

            // TODO - Add options here

            //   codeWriter.writeJavaLine(terms.join(" ") + ";");
        }
    };

    JdlGenerator.prototype.writeMemberVariableJava = function (codeWriter, elem, termsImport, termsVairiable, domain, options) {
        if (elem.name.length > 0) {
            var terms = [];
            //annotationJPA
            var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
            //str1.concat(' ', name);
            if (elem.type != "Long" && elem.type != "String" && elem.type != "Integer" && elem.type != "LocalDate" && elem.type != "Double" && elem.type != "Boolean") {
                for (var j = 0; j < elem.type.tags.length; j++) {
                    var domaine = "com.domain." + elem.type.tags[j].value;
                    if (elem.type.tags[j].name === "package" && domaine != domain) {
                        termsImport.push("import com.domain." + elem.type.tags[j].value + "." + elem.type.name + " ;\n");
                    }
                }
                termsVairiable.push("@Enumerated(EnumType.STRING)\n");
            }
            termsVairiable.push('@Column(name="' + name + '")\n');
            termsVairiable.push("    private" + " " + this.getType(elem));
            termsVairiable.push(elem.name + "; \n");

            //  codeWriter.writeLine(this.getType(elem))

            // TODO - Add options here

            //   codeWriter.writeJavaLine(terms.join(" ") + ";");
        }
    };
    /**
     * Write Methode Abstract
     * 
     */

    JdlGenerator.prototype.WriteMethodeGetterSetteur = function (codeWriter, object, elem, options) {
        if (elem.name.length > 0) {
            var terms = [];
            var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
            //Getter

            terms.push("public " + this.getType(elem));
            terms.push("get" + name + "() {\n");
            terms.push("     return this." + elem.name + ";\n");
            terms.push("  }")
            codeWriter.writeJavaLine(terms.join(" "));
            terms = [];

            //relation
           /* if (this.getType(elem) === "Boolean") {
                var attributename = elem.name.charAt(0).toLowerCase() + elem.name.slice(1);
                terms.push("public " + this.getType(elem) + " is" + elem.name + "() {\n");
                //  terms.push("     this."+elem.name+" = "+elem.name+" ;\n");
                terms.push("     return this." + elem.name + ";\n");
                terms.push(" }\n");
            }
            var attributename = elem.name.charAt(0).toLowerCase() + elem.name.slice(1);
            terms.push("public " + object.name + " " + attributename);
            terms.push("(" + this.getType(elem) + " " + elem.name + " " + ") {\n");
            terms.push("     this." + elem.name + " = " + elem.name + " ;\n");
            terms.push("     return this ;\n");
            terms.push(" }\n");*/



            //Setter

            terms.push(" public void ");
            terms.push("set" + name + "(" + this.getType(elem) + " " + name + ") {\n");
            terms.push("       this." + elem.name + "= " + name + ";\n");
            terms.push(" }");
            codeWriter.writeJavaLine(terms.join(" "));


        }
    };

    /*   /**
        * Write Methode Interface
        * @param {StringWriter} codeWriter
        * @param {type.Model} elem
        * @param {Object} options
        */
    /*JdlGenerator.prototype.WriteMethodeInterface = function(codeWriter, elem, options){
        if (elem.name.length > 0) {
            var terms = [];     
            //Getter    
            terms.push(this.getType(elem));
            terms.push("get"+elem.name+"() ; \n");
            codeWriter.writeJavaLine(terms.join(" "));
            terms=[];
            //Setter
            terms.push("void ");
            terms.push("set"+elem.name+"("+this.getType(elem)+" "+ elem.name+") ; \n");
            codeWriter.writeJavaLine(terms.join(" "));
    
        }
    };*/
    /**
     * Write Consturctor Vide
     */

    JdlGenerator.prototype.WirteConstructorVide = function (elem) {
        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
        var terms = [];
        terms.push("public " + name + "() {\n");
        terms.push("      super();\n");
        terms.push("  }");
        codeWriter.writeJavaLine(terms.join(" "));

    }

    /**
     * Write Constuctor de la class
     * 
     */

    JdlGenerator.prototype.WirteConstructor = function (elem) {
        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
        var i, len, terms = [];

        if (elem.attributes[0].type != "Long" && elem.attributes[0].type != "String" && elem.attributes[0].type != "Integer" && elem.attributes[0].type != "LocalDate" && elem.attributes[0].type != "Double" && elem.attributes[0].type != "Boolean") {
            terms.push("public " + name + "(" + elem.attributes[0].type.name + " " + elem.attributes[0].name);
        }
        else {
            terms.push("public " + name + "(" + elem.attributes[0].type + " " + elem.attributes[0].name);
        }

        for (i = 1, len = elem.attributes.length; i < len; i++) {
            if (elem.attributes[i].type != "Long" && elem.attributes[i].type != "String" && elem.attributes[i].type != "Integer" && elem.attributes[i].type != "LocalDate" && elem.attributes[i].type != "Double" && elem.attributes[i].type != "Boolean") {
                terms.push(" ," + elem.attributes[i].type.name + " " + elem.attributes[i].name);
            }
            else {
                terms.push(" ," + elem.attributes[i].type + " " + elem.attributes[i].name);

            }
        }
        terms.push(") {\n");

        for (i = 0, len = elem.attributes.length; i < len; i++) {
            var name = elem.attributes[i].name.charAt(0).toUpperCase() + elem.attributes[i].name.slice(1);
            terms.push("   this." + elem.attributes[i].name + " =" + elem.attributes[i].name + ";\n");
        }
        terms.push("}");
        codeWriter.writeJavaLine(terms.join(" "));
    }

    /**
     * Constrocture de la class extends
     */
    JdlGenerator.prototype.WirteConstructorExtends = function (elem1, elem) {
        var name = elem1.name.charAt(0).toUpperCase() + elem1.name.slice(1);
        var i, len, terms = [];
        if (elem.attributes[0].type != "Long" && elem.attributes[0].type != "String" && elem.attributes[0].type != "Integer" && elem.attributes[0].type != "LocalDate" && elem.attributes[0].type != "Double" && elem.attributes[0].type != "Boolean") {
            terms.push("public " + name + "(" + elem.attributes[0].type.name + " " + elem.attributes[0].name);
        }
        else {
            terms.push("public " + name + "(" + elem.attributes[0].type + " " + elem.attributes[0].name);
        }


        for (i = 1, len = elem.attributes.length; i < len; i++) {

            if (elem.attributes[i].type != "Long" && elem.attributes[i].type != "String" && elem.attributes[i].type != "Integer" && elem.attributes[i].type != "LocalDate" && elem.attributes[i].type != "Double" && elem.attributes[i].type != "Boolean") {
                terms.push("," + elem.attributes[i].type.name + " " + elem.attributes[i].name);
            }
            else {
                terms.push("," + elem.attributes[i].type + " " + elem.attributes[i].name);
            }

        }

        for (i = 0, len = elem1.attributes.length; i < len; i++) {
            if (elem1.attributes[i].type != "Long" && elem1.attributes[i].type != "String" && elem1.attributes[i].type != "Integer" && elem1.attributes[i].type != "LocalDate" && elem1.attributes[i].type != "Double" && elem1.attributes[i].type != "Boolean")
                terms.push(" ," + elem1.attributes[i].type.name + " " + elem1.attributes[i].name);
            else
                terms.push(" ," + elem1.attributes[i].type + " " + elem1.attributes[i].name);
        }
        terms.push(") {\n");
        terms.push("  super(" + elem.attributes[0].name);
        for (i = 1, len = elem.attributes.length; i < len; i++) {
            terms.push("," + elem.attributes[i].name);
        }
        terms.push(");\n");
        for (i = 0, len = elem1.attributes.length; i < len; i++) {
            var name = elem1.attributes[i].name.charAt(0).toUpperCase() + elem1.name.slice(1);
            terms.push("   this." + elem1.attributes[i].name + " =" + elem1.attributes[i].name + ";\n");
        }
        terms.push("}");
        codeWriter.writeJavaLine(terms.join(""));
    }


    /**
     * Write Enum
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    JdlGenerator.prototype.writeEnum = function (codeWriter, elem, domain, options) {
        var i, len;
        codeWriter.writeJavaLine("package " + domain + " ;");
        codeWriter.writeJavaLine();
        


        codeWriter.writeJavaLine(" public enum " + elem.name + " {");
        codeWriter.indent();

        // Literals
        for (i = 0, len = elem.literals.length; i < len; i++) {
            codeWriter.writeJavaLine(elem.literals[i].name.toUpperCase() + (i < elem.literals.length - 1 ? "," : ""));
        }

        codeWriter.outdent();
        codeWriter.writeJavaLine("}");
    };



    /**
     * Generate
     * @param {type.Model} baseModel
     * @param {string} basePath
     * @param {Object} options
     */
    function generate(baseModel, basePath, options) {
        var result = new $.Deferred();
        var jdlGen = new JdlGenerator(baseModel, basePath);
        return jdlGen.generate(baseModel, basePath + "/src/main/java/com/domain",basePath + "/src/main/java/com/repository",basePath + "/src/main/java/com/service",basePath + "/src/main/java/com/serviceImpl",basePath + "/src/main/java/com/controller", "com.domain","com.repository" ,"com.service" , "com.serviceImpl" ,"com.controller", options);
    }

    exports.generate = generate;

});
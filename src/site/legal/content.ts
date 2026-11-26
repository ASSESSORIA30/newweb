// Original legal texts of www.assessoria30.com, copied verbatim (ca/es) on 2026-11-25.
// Wording changes need legal validation first: see docs/legal-canvis-proposats.md.
export type LegalBlock = { p: string } | { h3: string } | { ul: string[] };
export type LegalDoc = { title: string; sections: { h: string; blocks: LegalBlock[] }[] };
export type LegalKey = "privacitat" | "cookies" | "avis-legal";

export const legal: Record<"ca" | "es", Record<LegalKey, LegalDoc>> = {
  "ca": {
    "privacitat": {
      "title": "Política de Privacitat",
      "sections": [
        {
          "h": "1. Responsable del tractament",
          "blocks": [
            {
              "p": "En compliment del que estableix el Reglament (UE) 2016/679 (RGPD) i la Llei Orgànica 3/2018 (LOPDGDD), s'informa que:"
            },
            {
              "ul": [
                "Responsable: Assessoria 3.0",
                "Titular: ASSESSORIA 3.0 AE, SL - B13639190",
                "Telèfon: 973982852",
                "Email: info@assessoria30.com"
              ]
            }
          ]
        },
        {
          "h": "2. Finalitat del tractament de les dades",
          "blocks": [
            {
              "p": "Les dades personals que es recullen a través d'aquesta web es tractaran amb les següents finalitats:"
            },
            {
              "ul": [
                "Gestionar consultes realitzades a través del formulari de contacte",
                "Oferir informació sobre serveis (energia, gas, fibra, assegurances, alarmes, etc.)",
                "Elaborar pressupostos personalitzats",
                "Gestionar contractacions i canvis de subministrament",
                "Enviar comunicacions comercials relacionades amb els serveis (si l'usuari ho autoritza)"
              ]
            }
          ]
        },
        {
          "h": "3. Legitimació",
          "blocks": [
            {
              "p": "La base legal per al tractament de les dades és:"
            },
            {
              "ul": [
                "El consentiment de l'usuari en enviar formularis",
                "L'execució d'un contracte o precontracte",
                "L'interès legítim per millorar els serveis i atenció al client"
              ]
            }
          ]
        },
        {
          "h": "4. Conservació de les dades",
          "blocks": [
            {
              "p": "Les dades es conservaran:"
            },
            {
              "ul": [
                "Mentre es mantingui la relació comercial",
                "Fins que l'usuari sol·liciti la seva eliminació",
                "Durant els terminis legals exigits"
              ]
            }
          ]
        },
        {
          "h": "5. Comunicació de dades a tercers",
          "blocks": [
            {
              "p": "Les dades podran ser comunicades a:"
            },
            {
              "ul": [
                "Comercialitzadores d'energia",
                "Empreses de telecomunicacions",
                "Companyies asseguradores",
                "Proveïdors de serveis contractats"
              ]
            },
            {
              "p": "Sempre amb la finalitat de gestionar correctament els serveis sol·licitats. No es vendran ni cediran dades a tercers amb finalitats comercials alienes."
            }
          ]
        },
        {
          "h": "6. Drets de l'usuari",
          "blocks": [
            {
              "p": "L'usuari pot exercir els següents drets:"
            },
            {
              "ul": [
                "Accedir a les seves dades",
                "Rectificar dades incorrectes",
                "Sol·licitar la seva supressió",
                "Limitar o oposar-se al tractament",
                "Sol·licitar la portabilitat de les dades"
              ]
            },
            {
              "p": "Per exercir-los, pot enviar un correu a: info@assessoria30.com"
            },
            {
              "p": "També té dret a presentar reclamació davant l'Agència Espanyola de Protecció de Dades (AEPD)."
            }
          ]
        },
        {
          "h": "7. Seguretat de les dades",
          "blocks": [
            {
              "p": "Assessoria 3.0 AE, SL aplica les mesures tècniques i organitzatives necessàries per garantir la seguretat i confidencialitat de les dades personals."
            }
          ]
        },
        {
          "h": "8. Cookies",
          "blocks": [
            {
              "p": "Aquesta web pot utilitzar cookies per millorar l'experiència de l'usuari. Pots consultar més informació a la Política de Cookies."
            }
          ]
        },
        {
          "h": "9. Modificacions",
          "blocks": [
            {
              "p": "Assessoria 3.0 AE, SL es reserva el dret de modificar la present política per adaptar-la a novetats legislatives o canvis en l'activitat."
            }
          ]
        },
        {
          "h": "10. Acceptació",
          "blocks": [
            {
              "p": "L'ús d'aquesta web implica l'acceptació d'aquesta Política de Privacitat."
            }
          ]
        },
        {
          "h": "11. Comparador SavEnergy IA: tractament automatitzat de factures",
          "blocks": [
            {
              "p": "Quan fas servir el comparador SavEnergy IA i hi puges una factura d'electricitat o de gas, Assessoria 3.0 AE, SL la tracta de manera automatitzada amb l'única finalitat de calcular una comparativa orientativa del teu subministrament. La base jurídica és el teu consentiment, que dones expressament abans de pujar la factura i que pots retirar en qualsevol moment."
            },
            {
              "h3": "Quines dades es tracten"
            },
            {
              "ul": [
                "La factura que aportes, que pot contenir el nom del titular, el document d'identitat, l'adreça, el CUPS i les dades de consum i de facturació.",
                "De la factura, a la sessió del comparador només es conserven les dades necessàries per al càlcul: tarifa d'accés, període i dies facturats, consums, potències, preus i imports. El nom, el document d'identitat, l'adreça i les dades bancàries no es desen a la sessió, i el CUPS només es mostra emmascarat.",
                "Dades tècniques de la connexió (l'adreça IP, resumida de manera que no es pot recuperar) per protegir el servei d'usos abusius."
              ]
            },
            {
              "h3": "Lectura automàtica i intel·ligència artificial"
            },
            {
              "p": "La factura es llegeix primer amb un sistema propi d'extracció de text. Només si aquesta lectura no és suficient o és contradictòria s'utilitza un servei d'intel·ligència artificial d'Anthropic, PBC (Estats Units), que actua com a encarregat del tractament. Sempre que la factura té text, a aquest servei se li envia únicament el text amb les dades identificatives (titular, document d'identitat, adreça, CUPS, dades bancàries, telèfons i correus electrònics) substituïdes per marques. Si la factura és una fotografia o un document escanejat no és possible emmascarar-les i s'envia el document. L'ús d'aquest servei pot implicar una transferència internacional de dades als Estats Units, que es fa amb les garanties adequades que exigeix el Reglament General de Protecció de Dades."
            },
            {
              "p": "El resultat és una estimació orientativa. No es prenen decisions basades únicament en el tractament automatitzat que produeixin efectes jurídics o t'afectin de manera significativa: qualsevol oferta la revisa i la prepara una persona de l'equip, i pots demanar sempre la intervenció d'una persona."
            },
            {
              "h3": "Consulta del SIPS"
            },
            {
              "p": "Si ho autoritzes expressament marcant la casella corresponent, i declares que ets el titular del subministrament o que hi estàs autoritzat, es consulta el Sistema d'Informació de Punts de Subministrament (SIPS) per obtenir el consum anual del punt de subministrament de la factura. La consulta és opcional, es fa només per a aquesta comparativa i només per al CUPS de la factura aportada."
            },
            {
              "h3": "Conservació"
            },
            {
              "ul": [
                "Si no demanes que et contactem, la factura i les dades llegides s'eliminen automàticament en un termini màxim de 24 hores.",
                "Si demanes que un assessor et contacti, la factura, les dades llegides i la comparativa s'incorporen a la teva sol·licitud i es conserven d'acord amb l'apartat 4 d'aquesta política.",
                "Els registres tècnics de seguretat i d'ús del servei no contenen la teva identitat."
              ]
            },
            {
              "h3": "Destinataris"
            },
            {
              "p": "A més d'Anthropic, intervenen com a encarregats del tractament Vercel, Inc. (allotjament), Supabase, Inc. (base de dades i emmagatzematge) i Cloudflare, Inc. (verificació contra usos automatitzats). Les teves dades no es comuniquen a cap comercialitzadora mentre no demanis expressament una oferta."
            },
            {
              "h3": "Els teus drets"
            },
            {
              "p": "Pots exercir els drets d'accés, rectificació, supressió, oposició, limitació del tractament i portabilitat, retirar el consentiment en qualsevol moment i sol·licitar que una persona revisi el resultat, escrivint a info@assessoria30.com. També pots presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (www.aepd.es) o l'Autoritat Catalana de Protecció de Dades (apdcat.gencat.cat)."
            }
          ]
        }
      ]
    },
    "cookies": {
      "title": "Política de Cookies",
      "sections": [
        {
          "h": "1. Què són les cookies?",
          "blocks": [
            {
              "p": "Les cookies són petits arxius que es descarreguen al dispositiu de l'usuari en accedir a una pàgina web, amb la finalitat d'emmagatzemar i recuperar informació."
            }
          ]
        },
        {
          "h": "2. Tipus de cookies utilitzades",
          "blocks": [
            {
              "p": "Aquest lloc web pot utilitzar:"
            },
            {
              "h3": "Cookies tècniques"
            },
            {
              "p": "Necessàries per al funcionament del web."
            },
            {
              "h3": "Cookies d'anàlisi"
            },
            {
              "p": "Permeten analitzar el comportament dels usuaris per millorar el servei (ex: Google Analytics)."
            },
            {
              "h3": "Cookies de personalització"
            },
            {
              "p": "Recorden preferències de navegació."
            },
            {
              "h3": "Cookies publicitàries (si escau)"
            },
            {
              "p": "Per mostrar anuncis rellevants."
            }
          ]
        },
        {
          "h": "3. Gestió de cookies",
          "blocks": [
            {
              "p": "L'usuari pot configurar el seu navegador per:"
            },
            {
              "ul": [
                "Permetre cookies",
                "Bloquejar-les",
                "Eliminar-les"
              ]
            }
          ]
        },
        {
          "h": "4. Consentiment",
          "blocks": [
            {
              "p": "En accedir a aquesta web, l'usuari accepta l'ús de cookies segons aquesta política."
            }
          ]
        },
        {
          "h": "5. Modificacions",
          "blocks": [
            {
              "p": "Assessoria 3.0 AE, SL pot modificar aquesta Política de Cookies per adaptar-la a canvis legislatius o tècnics."
            }
          ]
        }
      ]
    },
    "avis-legal": {
      "title": "Avís Legal",
      "sections": [
        {
          "h": "1. Dades identificatives",
          "blocks": [
            {
              "p": "En compliment amb el deure d'informació recollit a la Llei 34/2002 (LSSI-CE), s'informa que:"
            },
            {
              "ul": [
                "Denominació social: Assessoria 3.0 AE, SL",
                "CIF: B13639190",
                "Telèfon: 973 982 852",
                "Email: info@assessoria30.com"
              ]
            }
          ]
        },
        {
          "h": "2. Objecte",
          "blocks": [
            {
              "p": "El present lloc web té com a finalitat oferir informació sobre els serveis d'Assessoria 3.0 AE, SL, incloent:"
            },
            {
              "ul": [
                "Assessorament energètic",
                "Gas",
                "Fibra i telefonia",
                "Assegurances",
                "Alarmes",
                "Altres serveis relacionats"
              ]
            }
          ]
        },
        {
          "h": "3. Condicions d'ús",
          "blocks": [
            {
              "p": "L'accés i ús d'aquesta web atribueix la condició d'usuari i implica l'acceptació de totes les condicions incloses en aquest Avís Legal."
            },
            {
              "p": "L'usuari es compromet a fer un ús adequat dels continguts i a no utilitzar-los per:"
            },
            {
              "ul": [
                "Activitats il·lícites",
                "Difusió de continguts il·legals o ofensius",
                "Danyar sistemes físics o lògics"
              ]
            }
          ]
        },
        {
          "h": "4. Propietat intel·lectual",
          "blocks": [
            {
              "p": "Tots els continguts del lloc web (textos, imatges, logotips, disseny, etc.) són propietat d'Assessoria 3.0 AE, SL o disposen de llicència d'ús. Queda prohibida la seva reproducció, distribució o modificació sense autorització expressa."
            }
          ]
        },
        {
          "h": "5. Responsabilitat",
          "blocks": [
            {
              "p": "Assessoria 3.0 AE, SL no es fa responsable de:"
            },
            {
              "ul": [
                "Errors o omissions en els continguts",
                "Interrupcions del servei",
                "Danys derivats de l'ús del web"
              ]
            }
          ]
        },
        {
          "h": "6. Enllaços externs",
          "blocks": [
            {
              "p": "Aquest web pot contenir enllaços a webs de tercers. Assessoria 3.0 AE, SL no es responsabilitza dels seus continguts ni polítiques."
            }
          ]
        },
        {
          "h": "7. Legislació aplicable",
          "blocks": [
            {
              "p": "Aquest Avís Legal es regeix per la legislació espanyola."
            }
          ]
        }
      ]
    }
  },
  "es": {
    "privacitat": {
      "title": "Política de Privacidad",
      "sections": [
        {
          "h": "1. Responsable del tratamiento",
          "blocks": [
            {
              "p": "En cumplimiento de lo que establece el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), se informa que:"
            },
            {
              "ul": [
                "Responsable: Assessoria 3.0",
                "Titular: ASSESSORIA 3.0 AE, SL - B13639190",
                "Teléfono: 973982852",
                "Email: info@assessoria30.com"
              ]
            }
          ]
        },
        {
          "h": "2. Finalidad del tratamiento de los datos",
          "blocks": [
            {
              "p": "Los datos personales que se recogen a través de esta web se tratarán con las siguientes finalidades:"
            },
            {
              "ul": [
                "Gestionar consultas realizadas a través del formulario de contacto",
                "Ofrecer información sobre servicios (energía, gas, fibra, seguros, alarmas, etc.)",
                "Elaborar presupuestos personalizados",
                "Gestionar contrataciones y cambios de suministro",
                "Enviar comunicaciones comerciales relacionadas con los servicios (si el usuario lo autoriza)"
              ]
            }
          ]
        },
        {
          "h": "3. Legitimación",
          "blocks": [
            {
              "p": "La base legal para el tratamiento de los datos es:"
            },
            {
              "ul": [
                "El consentimiento del usuario al enviar formularios",
                "La ejecución de un contrato o precontrato",
                "El interés legítimo para mejorar los servicios y atención al cliente"
              ]
            }
          ]
        },
        {
          "h": "4. Conservación de los datos",
          "blocks": [
            {
              "p": "Los datos se conservarán:"
            },
            {
              "ul": [
                "Mientras se mantenga la relación comercial",
                "Hasta que el usuario solicite su eliminación",
                "Durante los plazos legales exigidos"
              ]
            }
          ]
        },
        {
          "h": "5. Comunicación de datos a terceros",
          "blocks": [
            {
              "p": "Los datos podrán ser comunicados a:"
            },
            {
              "ul": [
                "Comercializadoras de energía",
                "Empresas de telecomunicaciones",
                "Compañías aseguradoras",
                "Proveedores de servicios contratados"
              ]
            },
            {
              "p": "Siempre con la finalidad de gestionar correctamente los servicios solicitados. No se venderán ni cederán datos a terceros con finalidades comerciales ajenas."
            }
          ]
        },
        {
          "h": "6. Derechos del usuario",
          "blocks": [
            {
              "p": "El usuario puede ejercer los siguientes derechos:"
            },
            {
              "ul": [
                "Acceder a sus datos",
                "Rectificar datos incorrectos",
                "Solicitar su supresión",
                "Limitar u oponerse al tratamiento",
                "Solicitar la portabilidad de los datos"
              ]
            },
            {
              "p": "Para ejercerlos, puede enviar un correo a: info@assessoria30.com"
            },
            {
              "p": "También tiene derecho a presentar reclamación ante la Agencia Española de Protección de Datos (AEPD)."
            }
          ]
        },
        {
          "h": "7. Seguridad de los datos",
          "blocks": [
            {
              "p": "Asesoría 3.0 AE, SL aplica las medidas técnicas y organizativas necesarias para garantizar la seguridad y confidencialidad de los datos personales."
            }
          ]
        },
        {
          "h": "8. Cookies",
          "blocks": [
            {
              "p": "Esta web puede utilizar cookies para mejorar la experiencia del usuario. Puedes consultar más información en la Política de Cookies."
            }
          ]
        },
        {
          "h": "9. Modificaciones",
          "blocks": [
            {
              "p": "Asesoría 3.0 AE, SL se reserva el derecho de modificar la presente política para adaptarla a novedades legislativas o cambios en la actividad."
            }
          ]
        },
        {
          "h": "10. Aceptación",
          "blocks": [
            {
              "p": "El uso de esta web implica la aceptación de esta Política de Privacidad."
            }
          ]
        },
        {
          "h": "11. Comparador SavEnergy IA: tratamiento automatizado de facturas",
          "blocks": [
            {
              "p": "Cuando utilizas el comparador SavEnergy IA y subes una factura de electricidad o de gas, Assessoria 3.0 AE, SL la trata de forma automatizada con la única finalidad de calcular una comparativa orientativa de tu suministro. La base jurídica es tu consentimiento, que das expresamente antes de subir la factura y que puedes retirar en cualquier momento."
            },
            {
              "h3": "Qué datos se tratan"
            },
            {
              "ul": [
                "La factura que aportas, que puede contener el nombre del titular, el documento de identidad, la dirección, el CUPS y los datos de consumo y de facturación.",
                "De la factura, en la sesión del comparador solo se conservan los datos necesarios para el cálculo: tarifa de acceso, periodo y días facturados, consumos, potencias, precios e importes. El nombre, el documento de identidad, la dirección y los datos bancarios no se guardan en la sesión, y el CUPS solo se muestra enmascarado.",
                "Datos técnicos de la conexión (la dirección IP, resumida de forma que no se puede recuperar) para proteger el servicio de usos abusivos."
              ]
            },
            {
              "h3": "Lectura automática e inteligencia artificial"
            },
            {
              "p": "La factura se lee primero con un sistema propio de extracción de texto. Solo si esta lectura no es suficiente o es contradictoria se utiliza un servicio de inteligencia artificial de Anthropic, PBC (Estados Unidos), que actúa como encargado del tratamiento. Siempre que la factura tiene texto, a este servicio se le envía únicamente el texto con los datos identificativos (titular, documento de identidad, dirección, CUPS, datos bancarios, teléfonos y correos electrónicos) sustituidos por marcas. Si la factura es una fotografía o un documento escaneado no es posible enmascararlos y se envía el documento. El uso de este servicio puede implicar una transferencia internacional de datos a Estados Unidos, que se realiza con las garantías adecuadas que exige el Reglamento General de Protección de Datos."
            },
            {
              "p": "El resultado es una estimación orientativa. No se toman decisiones basadas únicamente en el tratamiento automatizado que produzcan efectos jurídicos o te afecten de manera significativa: cualquier oferta la revisa y la prepara una persona del equipo, y siempre puedes pedir la intervención de una persona."
            },
            {
              "h3": "Consulta del SIPS"
            },
            {
              "p": "Si lo autorizas expresamente marcando la casilla correspondiente, y declaras que eres el titular del suministro o que estás autorizado, se consulta el Sistema de Información de Puntos de Suministro (SIPS) para obtener el consumo anual del punto de suministro de la factura. La consulta es opcional, se hace solo para esta comparativa y solo para el CUPS de la factura aportada."
            },
            {
              "h3": "Conservación"
            },
            {
              "ul": [
                "Si no pides que te contactemos, la factura y los datos leídos se eliminan automáticamente en un plazo máximo de 24 horas.",
                "Si pides que un asesor te contacte, la factura, los datos leídos y la comparativa se incorporan a tu solicitud y se conservan de acuerdo con el apartado 4 de esta política.",
                "Los registros técnicos de seguridad y de uso del servicio no contienen tu identidad."
              ]
            },
            {
              "h3": "Destinatarios"
            },
            {
              "p": "Además de Anthropic, intervienen como encargados del tratamiento Vercel, Inc. (alojamiento), Supabase, Inc. (base de datos y almacenamiento) y Cloudflare, Inc. (verificación contra usos automatizados). Tus datos no se comunican a ninguna comercializadora mientras no pidas expresamente una oferta."
            },
            {
              "h3": "Tus derechos"
            },
            {
              "p": "Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, retirar el consentimiento en cualquier momento y solicitar que una persona revise el resultado, escribiendo a info@assessoria30.com. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es) o la Autoridad Catalana de Protección de Datos (apdcat.gencat.cat)."
            }
          ]
        }
      ]
    },
    "cookies": {
      "title": "Política de Cookies",
      "sections": [
        {
          "h": "1. ¿Qué son las cookies?",
          "blocks": [
            {
              "p": "Las cookies son pequeños archivos que se descargan en el dispositivo del usuario al acceder a una página web, con la finalidad de almacenar y recuperar información."
            }
          ]
        },
        {
          "h": "2. Tipos de cookies utilizadas",
          "blocks": [
            {
              "p": "Este sitio web puede utilizar:"
            },
            {
              "h3": "Cookies técnicas"
            },
            {
              "p": "Necesarias para el funcionamiento de la web."
            },
            {
              "h3": "Cookies de análisis"
            },
            {
              "p": "Permiten analizar el comportamiento de los usuarios para mejorar el servicio (ej: Google Analytics)."
            },
            {
              "h3": "Cookies de personalización"
            },
            {
              "p": "Recuerdan preferencias de navegación."
            },
            {
              "h3": "Cookies publicitarias (si aplica)"
            },
            {
              "p": "Para mostrar anuncios relevantes."
            }
          ]
        },
        {
          "h": "3. Gestión de cookies",
          "blocks": [
            {
              "p": "El usuario puede configurar su navegador para:"
            },
            {
              "ul": [
                "Permitir cookies",
                "Bloquearlas",
                "Eliminarlas"
              ]
            }
          ]
        },
        {
          "h": "4. Consentimiento",
          "blocks": [
            {
              "p": "Al acceder a esta web, el usuario acepta el uso de cookies según esta política."
            }
          ]
        },
        {
          "h": "5. Modificaciones",
          "blocks": [
            {
              "p": "Asesoría 3.0 AE, SL puede modificar esta Política de Cookies para adaptarla a cambios legislativos o técnicos."
            }
          ]
        }
      ]
    },
    "avis-legal": {
      "title": "Aviso Legal",
      "sections": [
        {
          "h": "1. Datos identificativos",
          "blocks": [
            {
              "p": "En cumplimiento con el deber de información recogido en la Ley 34/2002 (LSSI-CE), se informa que:"
            },
            {
              "ul": [
                "Denominación social: Assessoria 3.0 AE, SL",
                "CIF: B13639190",
                "Teléfono: 973 982 852",
                "Email: info@assessoria30.com"
              ]
            }
          ]
        },
        {
          "h": "2. Objeto",
          "blocks": [
            {
              "p": "El presente sitio web tiene como finalidad ofrecer información sobre los servicios de Asesoría 3.0 AE, SL, incluyendo:"
            },
            {
              "ul": [
                "Asesoramiento energético",
                "Gas",
                "Fibra y telefonía",
                "Seguros",
                "Alarmas",
                "Otros servicios relacionados"
              ]
            }
          ]
        },
        {
          "h": "3. Condiciones de uso",
          "blocks": [
            {
              "p": "El acceso y uso de esta web atribuye la condición de usuario e implica la aceptación de todas las condiciones incluidas en este Aviso Legal."
            },
            {
              "p": "El usuario se compromete a hacer un uso adecuado de los contenidos y a no utilizarlos para:"
            },
            {
              "ul": [
                "Actividades ilícitas",
                "Difusión de contenidos ilegales u ofensivos",
                "Dañar sistemas físicos o lógicos"
              ]
            }
          ]
        },
        {
          "h": "4. Propiedad intelectual",
          "blocks": [
            {
              "p": "Todos los contenidos del sitio web (textos, imágenes, logotipos, diseño, etc.) son propiedad de Asesoría 3.0 AE, SL o disponen de licencia de uso. Queda prohibida su reproducción, distribución o modificación sin autorización expresa."
            }
          ]
        },
        {
          "h": "5. Responsabilidad",
          "blocks": [
            {
              "p": "Asesoría 3.0 AE, SL no se hace responsable de:"
            },
            {
              "ul": [
                "Errores u omisiones en los contenidos",
                "Interrupciones del servicio",
                "Daños derivados del uso de la web"
              ]
            }
          ]
        },
        {
          "h": "6. Enlaces externos",
          "blocks": [
            {
              "p": "Este web puede contener enlaces a webs de terceros. Asesoría 3.0 AE, SL no se responsabiliza de sus contenidos ni políticas."
            }
          ]
        },
        {
          "h": "7. Legislación aplicable",
          "blocks": [
            {
              "p": "Este Aviso Legal se rige por la legislación española."
            }
          ]
        }
      ]
    }
  }
};

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

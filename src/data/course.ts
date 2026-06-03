import { CourseModule } from "@shared/types";
import { ensureMinimumQuizSize } from "./quizExpansion";

const baseCourseModules: CourseModule[] = [
  {
    id: "fundamentos",
    title: { es: "Fundamentos de redes", en: "Networking fundamentals" },
    description: {
      es: "Dispositivos, medios, modelos OSI/TCP-IP y diagnóstico básico por capas.",
      en: "Devices, media, OSI/TCP-IP models, and basic layered troubleshooting.",
    },
    difficulty: "Inicial",
    estimatedMinutes: 45,
    lessons: [
      {
        id: "fundamentos-dispositivos",
        title: { es: "Dispositivos, medios y modelos", en: "Devices, media, and models" },
        objective: {
          es: "Reconocer los elementos de una red y ubicar fallas iniciales por capa.",
          en: "Recognize network elements and place initial faults by layer.",
        },
        summary: {
          es: "Una red combina hosts, switches, routers, puntos de acceso, medios y protocolos. Los modelos OSI y TCP/IP ordenan la comunicación para entender encapsulación, direccionamiento y entrega.",
          en: "A network combines hosts, switches, routers, access points, media, and protocols. OSI and TCP/IP organize communication to explain encapsulation, addressing, and delivery.",
        },
        keyTerms: [
          { es: "host", en: "host" },
          { es: "switch", en: "switch" },
          { es: "router", en: "router" },
          { es: "PDU", en: "PDU" },
        ],
        example: {
          es: "Si un PC tiene enlace físico pero no llega al servidor, primero se revisa IP/gateway y luego rutas o filtros.",
          en: "If a PC has physical link but cannot reach a server, check IP/gateway first, then routes or filters.",
        },
        practice: {
          es: "En Packet Tracer conecta dos PCs, un switch y un router. Configura IPs, prueba ping y documenta en qué capa falla si cambias el gateway.",
          en: "In Packet Tracer connect two PCs, a switch, and a router. Configure IPs, test ping, and document which layer fails when you change the gateway.",
        },
        knowledgeEntryId: "network-foundations",
        sourceRefs: [{ sourceId: "fundamentos-redes-2", pages: [4, 18, 20, 22, 26, 30] }],
      },
    ],
    quiz: [
      {
        id: "q-fund-1",
        prompt: {
          es: "Un usuario tiene link activo, IP correcta y no llega a otra red. ¿Qué dispositivo es clave para salir de su LAN?",
          en: "A user has active link, correct IP, and cannot reach another network. Which device is key to leave the LAN?",
        },
        options: [
          { es: "Switch de acceso", en: "Access switch" },
          { es: "Router o gateway predeterminado", en: "Router or default gateway" },
          { es: "Servidor DNS únicamente", en: "DNS server only" },
          { es: "Hub Ethernet", en: "Ethernet hub" },
        ],
        correctIndex: 1,
        explanation: {
          es: "El gateway enruta paquetes hacia redes remotas; el switch solo conmuta dentro del dominio local.",
          en: "The gateway routes packets to remote networks; the switch only forwards inside the local domain.",
        },
      },
      {
        id: "q-fund-2",
        prompt: {
          es: "¿Qué comando Cisco da una primera vista rápida del estado e IP de interfaces?",
          en: "Which Cisco command gives a quick first view of interface status and IP addressing?",
        },
        options: [
          { es: "show ip interface brief", en: "show ip interface brief" },
          { es: "show running-config vlan", en: "show running-config vlan" },
          { es: "copy run start", en: "copy run start" },
          { es: "erase startup-config", en: "erase startup-config" },
        ],
        correctIndex: 0,
        explanation: {
          es: "show ip interface brief resume direcciones y estados up/down, útil para diagnóstico inicial.",
          en: "show ip interface brief summarizes addresses and up/down states, useful for initial troubleshooting.",
        },
      },
      {
        id: "q-fund-3",
        prompt: {
          es: "Si ping por IP funciona pero ping por nombre falla, ¿qué servicio sospechas primero?",
          en: "If ping by IP works but ping by name fails, which service do you suspect first?",
        },
        options: [
          { es: "STP", en: "STP" },
          { es: "DNS", en: "DNS" },
          { es: "LACP", en: "LACP" },
          { es: "PoE", en: "PoE" },
        ],
        correctIndex: 1,
        explanation: {
          es: "La conectividad IP existe; el problema apunta a resolución de nombres.",
          en: "IP connectivity exists; the problem points to name resolution.",
        },
      },
    ],
  },
  {
    id: "ipv4-ipv6-subnetting",
    title: { es: "Direccionamiento IPv6", en: "IPv6 addressing" },
    description: {
      es: "Notación IPv6, tipos de direcciones, /64, SLAAC, DHCPv6 e ICMPv6.",
      en: "IPv6 notation, address types, /64, SLAAC, DHCPv6, and ICMPv6.",
    },
    difficulty: "Intermedio",
    estimatedMinutes: 55,
    lessons: [
      {
        id: "ipv6-basico",
        title: { es: "Direcciones IPv6 y verificación", en: "IPv6 addresses and verification" },
        objective: {
          es: "Configurar y verificar direcciones IPv6 globales y link-local en interfaces Cisco.",
          en: "Configure and verify IPv6 global and link-local addresses on Cisco interfaces.",
        },
        summary: {
          es: "IPv6 usa 128 bits, hextetos, prefijos y multicast en lugar de broadcast. Una interfaz puede tener direcciones global unicast, link-local FE80::/10 y multicast; el /64 es común en LAN.",
          en: "IPv6 uses 128 bits, hextets, prefixes, and multicast instead of broadcast. An interface can have global unicast, FE80::/10 link-local, and multicast addresses; /64 is common on LANs.",
        },
        keyTerms: [
          { es: "global unicast", en: "global unicast" },
          { es: "link-local", en: "link-local" },
          { es: "SLAAC", en: "SLAAC" },
          { es: "ICMPv6", en: "ICMPv6" },
        ],
        example: {
          es: "R1 G0/0 puede usar 2001:db8:10::1/64 para la LAN y fe80::1 como link-local estable para vecinos y next-hop.",
          en: "R1 G0/0 can use 2001:db8:10::1/64 for the LAN and fe80::1 as a stable link-local for neighbors and next hop.",
        },
        practice: {
          es: "Activa ipv6 unicast-routing, configura una GUA y una link-local manual, luego valida con show ipv6 interface brief y ping IPv6.",
          en: "Enable ipv6 unicast-routing, configure a GUA and manual link-local, then validate with show ipv6 interface brief and IPv6 ping.",
        },
        knowledgeEntryId: "ipv6-addressing-core",
        sourceRefs: [
          { sourceId: "ipv6-addressing", pages: [20, 34, 54, 55, 56, 59, 66, 67, 76, 77] },
          { sourceId: "routing-fundamentals", pages: [2, 4, 5, 6, 7, 10, 11, 14] },
        ],
      },
    ],
    quiz: [
      {
        id: "q-ip-1",
        prompt: { es: "¿Qué prefijo IPv6 es el tamaño típico de una LAN?", en: "Which IPv6 prefix is the typical LAN size?" },
        options: [
          { es: "/48", en: "/48" },
          { es: "/56", en: "/56" },
          { es: "/64", en: "/64" },
          { es: "/128", en: "/128" },
        ],
        correctIndex: 2,
        explanation: {
          es: "El /64 es el tamaño común de subred IPv6 para segmentos LAN.",
          en: "/64 is the common IPv6 subnet size for LAN segments.",
        },
      },
      {
        id: "q-ip-2",
        prompt: { es: "¿Qué comando habilita el reenvío IPv6 en un router Cisco?", en: "Which command enables IPv6 forwarding on a Cisco router?" },
        options: [
          { es: "ip routing", en: "ip routing" },
          { es: "ipv6 unicast-routing", en: "ipv6 unicast-routing" },
          { es: "ipv6 enable trunk", en: "ipv6 enable trunk" },
          { es: "show ipv6 route", en: "show ipv6 route" },
        ],
        correctIndex: 1,
        explanation: {
          es: "Sin ipv6 unicast-routing el router puede tener direcciones IPv6, pero no enruta tráfico IPv6 entre interfaces.",
          en: "Without ipv6 unicast-routing the router can have IPv6 addresses, but it does not route IPv6 traffic between interfaces.",
        },
      },
      {
        id: "q-ip-3",
        prompt: { es: "IPv6 no usa broadcast. ¿Qué mecanismo reemplaza muchas funciones de descubrimiento?", en: "IPv6 does not use broadcast. What mechanism replaces many discovery functions?" },
        options: [
          { es: "Neighbor Discovery con ICMPv6", en: "Neighbor Discovery with ICMPv6" },
          { es: "ARP clásico", en: "Classic ARP" },
          { es: "VTP", en: "VTP" },
          { es: "NAT overload", en: "NAT overload" },
        ],
        correctIndex: 0,
        explanation: {
          es: "Neighbor Discovery usa ICMPv6 y multicast para descubrir vecinos, routers y parámetros.",
          en: "Neighbor Discovery uses ICMPv6 and multicast to discover neighbors, routers, and parameters.",
        },
      },
    ],
  },
  {
    id: "routing-servicios",
    title: { es: "Routing estático y dinámico", en: "Static and dynamic routing" },
    description: {
      es: "Rutas estáticas, rutas predeterminadas, métricas y selección de camino.",
      en: "Static routes, default routes, metrics, and path selection.",
    },
    difficulty: "Intermedio",
    estimatedMinutes: 60,
    lessons: [
      {
        id: "routing-basico",
        title: { es: "Rutas, next-hop y verificación", en: "Routes, next hop, and verification" },
        objective: {
          es: "Elegir cuándo usar rutas estáticas, default routes o protocolos dinámicos y verificar la tabla de routing.",
          en: "Choose when to use static routes, default routes, or dynamic protocols and verify the routing table.",
        },
        summary: {
          es: "Una ruta define cómo llegar a una red destino. Las rutas estáticas son manuales; los protocolos dinámicos como RIP, EIGRP y OSPF aprenden redes y recalculan caminos mediante métricas.",
          en: "A route defines how to reach a destination network. Static routes are manual; dynamic protocols such as RIP, EIGRP, and OSPF learn networks and recalculate paths through metrics.",
        },
        keyTerms: [
          { es: "next-hop", en: "next hop" },
          { es: "ruta predeterminada", en: "default route" },
          { es: "métrica", en: "metric" },
          { es: "tabla de routing", en: "routing table" },
        ],
        example: {
          es: "Una sucursal con un solo enlace al core puede usar ip route 0.0.0.0 0.0.0.0 10.0.0.1 como salida predeterminada.",
          en: "A branch with one uplink to the core can use ip route 0.0.0.0 0.0.0.0 10.0.0.1 as the default exit.",
        },
        practice: {
          es: "Crea tres routers en línea, configura redes LAN y rutas estáticas. Rompe un next-hop y confirma el síntoma con show ip route y traceroute.",
          en: "Create three routers in a line, configure LANs and static routes. Break one next hop and confirm the symptom with show ip route and traceroute.",
        },
        knowledgeEntryId: "routing-static-dynamic",
        sourceRefs: [
          { sourceId: "routing-fundamentals", pages: [20, 35, 36, 46] },
          { sourceId: "routing-protocols", pages: [5, 11, 17] },
        ],
      },
    ],
    quiz: [
      {
        id: "q-route-1",
        prompt: { es: "¿Para qué se usa una ruta 0.0.0.0/0?", en: "What is a 0.0.0.0/0 route used for?" },
        options: [
          { es: "Enviar tráfico sin coincidencia más específica", en: "Send traffic with no more specific match" },
          { es: "Crear una VLAN nativa", en: "Create a native VLAN" },
          { es: "Asignar DNS por DHCP", en: "Assign DNS through DHCP" },
          { es: "Bloquear bucles de capa 2", en: "Block layer 2 loops" },
        ],
        correctIndex: 0,
        explanation: {
          es: "La ruta predeterminada se consulta cuando no hay una ruta más específica hacia el destino.",
          en: "The default route is used when there is no more specific route to the destination.",
        },
      },
      {
        id: "q-route-2",
        prompt: { es: "Un ping falla entre LANs. ¿Qué verificación confirma si el router conoce la red remota?", en: "A ping fails between LANs. Which check confirms whether the router knows the remote network?" },
        options: [
          { es: "show ip route", en: "show ip route" },
          { es: "show vlan brief", en: "show vlan brief" },
          { es: "show etherchannel summary", en: "show etherchannel summary" },
          { es: "show telephony-service", en: "show telephony-service" },
        ],
        correctIndex: 0,
        explanation: {
          es: "La tabla de routing muestra rutas conectadas, estáticas y aprendidas dinámicamente.",
          en: "The routing table shows connected, static, and dynamically learned routes.",
        },
      },
      {
        id: "q-route-3",
        prompt: { es: "¿Qué protocolo usa costo asociado normalmente al ancho de banda?", en: "Which protocol uses cost normally associated with bandwidth?" },
        options: [
          { es: "RIP", en: "RIP" },
          { es: "OSPF", en: "OSPF" },
          { es: "DHCP", en: "DHCP" },
          { es: "STP", en: "STP" },
        ],
        correctIndex: 1,
        explanation: {
          es: "OSPF calcula rutas con costo; RIP usa saltos y EIGRP usa una métrica compuesta.",
          en: "OSPF calculates routes using cost; RIP uses hops and EIGRP uses a composite metric.",
        },
      },
    ],
  },
  {
    id: "ipv6-routing-protocols",
    title: { es: "Routing IPv6", en: "IPv6 routing" },
    description: {
      es: "RIPng, EIGRP para IPv6, OSPFv3, router-id y passive-interface.",
      en: "RIPng, EIGRP for IPv6, OSPFv3, router ID, and passive-interface.",
    },
    difficulty: "Avanzado",
    estimatedMinutes: 65,
    lessons: [
      {
        id: "ipv6-routing-protocols-lesson",
        title: { es: "Protocolos de routing IPv6 en IOS", en: "IPv6 routing protocols in IOS" },
        objective: {
          es: "Activar y verificar routing IPv6 dinámico usando procesos Cisco IOS.",
          en: "Enable and verify dynamic IPv6 routing using Cisco IOS processes.",
        },
        summary: {
          es: "RIPng se habilita por interfaz, EIGRP para IPv6 requiere proceso, router-id y no shutdown, y OSPFv3 usa link-local y multicast FF02::5/FF02::6.",
          en: "RIPng is enabled per interface, EIGRP for IPv6 requires process, router ID, and no shutdown, and OSPFv3 uses link-local and FF02::5/FF02::6 multicast.",
        },
        keyTerms: [
          { es: "RIPng", en: "RIPng" },
          { es: "OSPFv3", en: "OSPFv3" },
          { es: "router-id", en: "router ID" },
          { es: "passive-interface", en: "passive-interface" },
        ],
        example: {
          es: "En una red sin IPv4, OSPFv3 aún necesita router-id manual como 2.2.2.2 para identificar el proceso.",
          en: "In a network without IPv4, OSPFv3 still needs a manual router ID such as 2.2.2.2 to identify the process.",
        },
        practice: {
          es: "Configura OSPFv3 en tres routers con área 0, marca la LAN como passive-interface y valida vecinos/rutas IPv6.",
          en: "Configure OSPFv3 on three routers with area 0, set the LAN as passive-interface, and validate IPv6 neighbors/routes.",
        },
        knowledgeEntryId: "ipv6-routing-protocols",
        sourceRefs: [{ sourceId: "routing-protocols", pages: [20, 35, 40, 49, 51, 52, 55, 56, 58] }],
      },
    ],
    quiz: [
      {
        id: "q-ipv6route-1",
        prompt: { es: "¿Qué comando activa RIPng en una interfaz?", en: "Which command enables RIPng on an interface?" },
        options: [
          { es: "ipv6 rip RIP-AS enable", en: "ipv6 rip RIP-AS enable" },
          { es: "router ripng 1", en: "router ripng 1" },
          { es: "ip rip enable", en: "ip rip enable" },
          { es: "network 2001:db8::/64", en: "network 2001:db8::/64" },
        ],
        correctIndex: 0,
        explanation: {
          es: "RIPng se asocia a interfaces con ipv6 rip nombre enable.",
          en: "RIPng is attached to interfaces with ipv6 rip name enable.",
        },
      },
      {
        id: "q-ipv6route-2",
        prompt: { es: "OSPFv3 no arranca porque no hay IPv4 configurado. ¿Qué suele faltar?", en: "OSPFv3 does not start because no IPv4 is configured. What is usually missing?" },
        options: [
          { es: "VLAN nativa", en: "Native VLAN" },
          { es: "Router-id manual", en: "Manual router ID" },
          { es: "Opción 150", en: "Option 150" },
          { es: "PortFast", en: "PortFast" },
        ],
        correctIndex: 1,
        explanation: {
          es: "Sin una IPv4 utilizable, se debe configurar router-id manual en el proceso.",
          en: "Without a usable IPv4 address, a manual router ID must be configured in the process.",
        },
      },
      {
        id: "q-ipv6route-3",
        prompt: { es: "¿Qué hace passive-interface en un protocolo de routing?", en: "What does passive-interface do in a routing protocol?" },
        options: [
          { es: "Evita enviar actualizaciones por esa interfaz", en: "Prevents sending updates out that interface" },
          { es: "Desactiva toda la interfaz física", en: "Shuts the physical interface down" },
          { es: "Convierte el puerto en trunk", en: "Turns the port into a trunk" },
          { es: "Cambia la dirección MAC", en: "Changes the MAC address" },
        ],
        correctIndex: 0,
        explanation: {
          es: "La red puede anunciarse, pero no se forman vecinos ni se envían actualizaciones por esa interfaz.",
          en: "The network can still be advertised, but neighbors/updates are not sent through that interface.",
        },
      },
    ],
  },
  {
    id: "switching-vlans",
    title: { es: "VLAN, trunks e inter-VLAN", en: "VLANs, trunks, and inter-VLAN" },
    description: {
      es: "Segmentación, 802.1Q, VLAN nativa, SVI y router-on-a-stick.",
      en: "Segmentation, 802.1Q, native VLAN, SVI, and router-on-a-stick.",
    },
    difficulty: "Intermedio",
    estimatedMinutes: 60,
    lessons: [
      {
        id: "vlans-trunks",
        title: { es: "Segmentación VLAN y enlaces trunk", en: "VLAN segmentation and trunk links" },
        objective: {
          es: "Configurar VLANs, puertos access, trunks y routing inter-VLAN básico.",
          en: "Configure VLANs, access ports, trunks, and basic inter-VLAN routing.",
        },
        summary: {
          es: "Las VLAN separan dominios de broadcast. Un trunk transporta varias VLAN con etiquetas 802.1Q; la comunicación entre VLANs requiere router-on-a-stick o switch multicapa.",
          en: "VLANs separate broadcast domains. A trunk carries multiple VLANs with 802.1Q tags; communication between VLANs requires router-on-a-stick or a multilayer switch.",
        },
        keyTerms: [
          { es: "VLAN", en: "VLAN" },
          { es: "trunk", en: "trunk" },
          { es: "VLAN nativa", en: "native VLAN" },
          { es: "SVI", en: "SVI" },
        ],
        example: {
          es: "VLAN 10 datos, VLAN 20 docentes y VLAN 99 administración viajan por el trunk hacia el router con subinterfaces dot1Q.",
          en: "VLAN 10 data, VLAN 20 faculty, and VLAN 99 management travel over the trunk to the router with dot1Q subinterfaces.",
        },
        practice: {
          es: "Crea dos switches y un router-on-a-stick. Configura VLAN 10/20/99, trunk allowed VLAN y prueba ping entre VLANs.",
          en: "Create two switches and a router-on-a-stick. Configure VLAN 10/20/99, trunk allowed VLAN, and test ping between VLANs.",
        },
        knowledgeEntryId: "vlans-trunks-intervlan",
        sourceRefs: [
          { sourceId: "vlan-stp-etherchannel-voip", pages: [3, 4, 5, 7, 10, 13, 14, 19] },
          { sourceId: "escenario-campus", pages: [1, 2] },
        ],
      },
    ],
    quiz: [
      {
        id: "q-vlan-1",
        prompt: { es: "¿Qué problema resuelve principalmente una VLAN?", en: "What problem does a VLAN primarily solve?" },
        options: [
          { es: "Segmentar dominios de broadcast", en: "Segment broadcast domains" },
          { es: "Reemplazar rutas IP", en: "Replace IP routes" },
          { es: "Asignar extensiones VoIP", en: "Assign VoIP extensions" },
          { es: "Eliminar STP siempre", en: "Always remove STP" },
        ],
        correctIndex: 0,
        explanation: {
          es: "Una VLAN crea una separación lógica de capa 2 y limita broadcasts a su dominio.",
          en: "A VLAN creates logical layer 2 separation and limits broadcasts to its domain.",
        },
      },
      {
        id: "q-vlan-2",
        prompt: { es: "¿Qué comando limita las VLAN permitidas en un trunk?", en: "Which command limits VLANs allowed on a trunk?" },
        options: [
          { es: "switchport trunk allowed vlan 10,20,99", en: "switchport trunk allowed vlan 10,20,99" },
          { es: "switchport access vlan 10", en: "switchport access vlan 10" },
          { es: "ip route vlan 10", en: "ip route vlan 10" },
          { es: "spanning-tree portfast", en: "spanning-tree portfast" },
        ],
        correctIndex: 0,
        explanation: {
          es: "En un trunk, allowed vlan define qué VLANs cruzan ese enlace.",
          en: "On a trunk, allowed vlan defines which VLANs cross that link.",
        },
      },
      {
        id: "q-vlan-3",
        prompt: { es: "En router-on-a-stick, ¿qué identifica la VLAN en cada subinterfaz?", en: "In router-on-a-stick, what identifies the VLAN on each subinterface?" },
        options: [
          { es: "encapsulation dot1Q", en: "encapsulation dot1Q" },
          { es: "channel-group active", en: "channel-group active" },
          { es: "ip helper-address", en: "ip helper-address" },
          { es: "telephony-service", en: "telephony-service" },
        ],
        correctIndex: 0,
        explanation: {
          es: "encapsulation dot1Q asocia la subinterfaz del router con el ID de VLAN.",
          en: "encapsulation dot1Q maps the router subinterface to the VLAN ID.",
        },
      },
    ],
  },
  {
    id: "ccna2-switching-concepts",
    title: { es: "Conmutación y administración de switch", en: "Switching and switch management" },
    description: {
      es: "Aprendizaje MAC, dominios de colisión/broadcast, dúplex, SVI y administración remota.",
      en: "MAC learning, collision/broadcast domains, duplex, SVI, and remote management.",
    },
    difficulty: "Inicial",
    estimatedMinutes: 50,
    lessons: [
      {
        id: "ccna2-switching-concepts-lesson",
        title: { es: "Cómo reenvía tramas un switch", en: "How a switch forwards frames" },
        objective: {
          es: "Explicar el aprendizaje MAC, verificar la tabla MAC y configurar administración básica de un switch capa 2.",
          en: "Explain MAC learning, verify the MAC table, and configure basic management on a layer 2 switch.",
        },
        summary: {
          es: "Un switch aprende direcciones MAC origen por puerto, consulta la tabla MAC/CAM para reenviar unicast conocidos, inunda unicast desconocidos y broadcasts, y separa dominios de colisión por puerto. Para administrarlo remotamente usa una SVI, gateway predeterminado y acceso seguro.",
          en: "A switch learns source MAC addresses per port, checks the MAC/CAM table to forward known unicasts, floods unknown unicasts and broadcasts, and separates collision domains per port. Remote management uses an SVI, default gateway, and secure access.",
        },
        keyTerms: [
          { es: "tabla MAC", en: "MAC table" },
          { es: "SVI", en: "SVI" },
          { es: "dúplex", en: "duplex" },
          { es: "gateway del switch", en: "switch default gateway" },
        ],
        example: {
          es: "S1 aprende la MAC de PC-A por F0/1. Si PC-A envía a una MAC desconocida, S1 inunda la trama por los demás puertos de la misma VLAN.",
          en: "S1 learns PC-A's MAC on F0/1. If PC-A sends to an unknown MAC, S1 floods the frame out the other ports in the same VLAN.",
        },
        practice: {
          es: "Configura interface vlan 99 con IP de administración, ip default-gateway y SSH. Genera tráfico entre PCs y valida aprendizaje con show mac address-table y show interfaces status.",
          en: "Configure interface vlan 99 with management IP, ip default-gateway, and SSH. Generate PC traffic and validate learning with show mac address-table and show interfaces status.",
        },
        knowledgeEntryId: "ccna2-switching-concepts",
        sourceRefs: [{ sourceId: "fundamentos-redes-2", pages: [18, 20, 22, 30] }],
      },
    ],
    quiz: [
      {
        id: "q-ccna2-switch-1",
        prompt: { es: "¿Cómo aprende un switch una dirección MAC?", en: "How does a switch learn a MAC address?" },
        options: [
          { es: "Leyendo la MAC origen de las tramas entrantes", en: "By reading the source MAC of incoming frames" },
          { es: "Consultando DNS", en: "By querying DNS" },
          { es: "Usando el gateway predeterminado", en: "By using the default gateway" },
          { es: "A partir del router-id OSPF", en: "From the OSPF router ID" },
        ],
        correctIndex: 0,
        explanation: {
          es: "El switch asocia la MAC origen con el puerto por donde llegó la trama.",
          en: "The switch maps the source MAC to the port where the frame arrived.",
        },
      },
      {
        id: "q-ccna2-switch-2",
        prompt: { es: "¿Qué necesita un switch capa 2 para ser administrado desde otra red?", en: "What does a layer 2 switch need to be managed from another network?" },
        options: [
          { es: "SVI con IP y ip default-gateway", en: "SVI with IP and ip default-gateway" },
          { es: "OSPFv3 en cada puerto access", en: "OSPFv3 on each access port" },
          { es: "NAT overload", en: "NAT overload" },
          { es: "Una ruta estática en cada PC", en: "A static route on every PC" },
        ],
        correctIndex: 0,
        explanation: {
          es: "La SVI da IP de administración local; ip default-gateway permite responder a redes remotas.",
          en: "The SVI provides local management IP; ip default-gateway lets it reply to remote networks.",
        },
      },
      {
        id: "q-ccna2-switch-3",
        prompt: { es: "¿Qué comando muestra la tabla MAC aprendida?", en: "Which command shows the learned MAC table?" },
        options: [
          { es: "show mac address-table", en: "show mac address-table" },
          { es: "show ip route", en: "show ip route" },
          { es: "show standby brief", en: "show standby brief" },
          { es: "show access-lists", en: "show access-lists" },
        ],
        correctIndex: 0,
        explanation: {
          es: "show mac address-table permite verificar VLAN, MAC, tipo y puerto aprendido.",
          en: "show mac address-table verifies VLAN, MAC, type, and learned port.",
        },
      },
    ],
  },
  {
    id: "stp-etherchannel",
    title: { es: "STP y EtherChannel", en: "STP and EtherChannel" },
    description: {
      es: "Prevención de bucles, PortFast, BPDU Guard, LACP y port-channel.",
      en: "Loop prevention, PortFast, BPDU Guard, LACP, and port-channel.",
    },
    difficulty: "Intermedio",
    estimatedMinutes: 45,
    lessons: [
      {
        id: "stp-etherchannel-lesson",
        title: { es: "Redundancia segura en capa 2", en: "Safe layer 2 redundancy" },
        objective: {
          es: "Evitar bucles de capa 2 y agrupar enlaces físicos de forma consistente.",
          en: "Avoid layer 2 loops and bundle physical links consistently.",
        },
        summary: {
          es: "STP bloquea caminos redundantes para evitar bucles. EtherChannel agrupa enlaces en un port-channel lógico y exige consistencia de trunking, VLAN, velocidad y dúplex.",
          en: "STP blocks redundant paths to avoid loops. EtherChannel bundles links into a logical port-channel and requires consistency in trunking, VLANs, speed, and duplex.",
        },
        keyTerms: [
          { es: "root bridge", en: "root bridge" },
          { es: "PortFast", en: "PortFast" },
          { es: "BPDU Guard", en: "BPDU Guard" },
          { es: "LACP", en: "LACP" },
        ],
        example: {
          es: "Dos switches conectados por dos cables pueden usar channel-group 1 mode active para formar Port-channel 1 sin que STP bloquee cada enlace individual.",
          en: "Two switches connected by two cables can use channel-group 1 mode active to form Port-channel 1 without STP blocking each individual link.",
        },
        practice: {
          es: "Configura Rapid PVST, PortFast/BPDU Guard en puertos de PC y un EtherChannel LACP trunk entre dos switches. Verifica con show spanning-tree y show etherchannel summary.",
          en: "Configure Rapid PVST, PortFast/BPDU Guard on PC ports, and a trunk LACP EtherChannel between two switches. Verify with show spanning-tree and show etherchannel summary.",
        },
        knowledgeEntryId: "stp-etherchannel",
        sourceRefs: [{ sourceId: "vlan-stp-etherchannel-voip", pages: [40, 43] }],
      },
    ],
    quiz: [
      {
        id: "q-stp-1",
        prompt: { es: "¿Cuál es el propósito principal de STP?", en: "What is STP's main purpose?" },
        options: [
          { es: "Evitar bucles de capa 2", en: "Prevent layer 2 loops" },
          { es: "Asignar direcciones IPv6", en: "Assign IPv6 addresses" },
          { es: "Traducir DNS", en: "Translate DNS" },
          { es: "Crear extensiones telefónicas", en: "Create phone extensions" },
        ],
        correctIndex: 0,
        explanation: {
          es: "STP mantiene redundancia física bloqueando enlaces que producirían bucles.",
          en: "STP keeps physical redundancy while blocking links that would create loops.",
        },
      },
      {
        id: "q-stp-2",
        prompt: { es: "¿Qué modo LACP inicia activamente la negociación?", en: "Which LACP mode actively initiates negotiation?" },
        options: [
          { es: "active", en: "active" },
          { es: "auto", en: "auto" },
          { es: "desirable", en: "desirable" },
          { es: "access", en: "access" },
        ],
        correctIndex: 0,
        explanation: {
          es: "LACP usa active/passive; active inicia la negociación del EtherChannel.",
          en: "LACP uses active/passive; active initiates EtherChannel negotiation.",
        },
      },
      {
        id: "q-stp-3",
        prompt: { es: "Un puerto PortFast recibe BPDUs y se apaga. ¿Qué protección actuó?", en: "A PortFast port receives BPDUs and shuts down. Which protection acted?" },
        options: [
          { es: "BPDU Guard", en: "BPDU Guard" },
          { es: "DHCP snooping", en: "DHCP snooping" },
          { es: "OSPFv3", en: "OSPFv3" },
          { es: "SLAAC", en: "SLAAC" },
        ],
        correctIndex: 0,
        explanation: {
          es: "BPDU Guard protege puertos finales apagándolos si detectan BPDUs inesperadas.",
          en: "BPDU Guard protects edge ports by shutting them down if unexpected BPDUs are detected.",
        },
      },
    ],
  },
  {
    id: "ccna2-lan-security",
    title: { es: "Seguridad LAN y del switch", en: "LAN and switch security" },
    description: {
      es: "Ataques de capa 2, port-security, DHCP snooping, Dynamic ARP Inspection y protección STP.",
      en: "Layer 2 attacks, port security, DHCP snooping, Dynamic ARP Inspection, and STP protections.",
    },
    difficulty: "Avanzado",
    estimatedMinutes: 70,
    lessons: [
      {
        id: "ccna2-lan-security-lesson",
        title: { es: "Defensas de capa 2", en: "Layer 2 defenses" },
        objective: {
          es: "Configurar controles básicos contra ataques comunes de switch en Packet Tracer.",
          en: "Configure basic controls against common switch attacks in Packet Tracer.",
        },
        summary: {
          es: "CCNA 2 exige reconocer ataques como MAC flooding, VLAN hopping, DHCP spoofing, ARP spoofing y manipulación STP. Las defensas incluyen deshabilitar puertos no usados, definir puertos access/trunk explícitos, port-security, DHCP snooping, DAI, PortFast y BPDU Guard.",
          en: "CCNA 2 requires recognizing attacks such as MAC flooding, VLAN hopping, DHCP spoofing, ARP spoofing, and STP manipulation. Defenses include disabling unused ports, explicitly setting access/trunk ports, port security, DHCP snooping, DAI, PortFast, and BPDU Guard.",
        },
        keyTerms: [
          { es: "port-security", en: "port security" },
          { es: "DHCP snooping", en: "DHCP snooping" },
          { es: "DAI", en: "DAI" },
          { es: "BPDU Guard", en: "BPDU Guard" },
        ],
        example: {
          es: "Un atacante conecta un servidor DHCP falso en un puerto access. DHCP snooping bloquea ofertas DHCP en puertos no confiables y mantiene una base para DAI.",
          en: "An attacker connects a rogue DHCP server to an access port. DHCP snooping blocks DHCP offers on untrusted ports and maintains a binding database for DAI.",
        },
        practice: {
          es: "En un switch con VLAN 10, activa port-security sticky en F0/1, DHCP snooping para VLAN 10, confía solo el trunk hacia el router y habilita ip arp inspection vlan 10. Verifica con show ip dhcp snooping binding y show port-security interface.",
          en: "On a switch with VLAN 10, enable sticky port security on F0/1, DHCP snooping for VLAN 10, trust only the trunk toward the router, and enable ip arp inspection vlan 10. Verify with show ip dhcp snooping binding and show port-security interface.",
        },
        knowledgeEntryId: "ccna2-lan-security",
        sourceRefs: [{ sourceId: "vlan-stp-etherchannel-voip", pages: [40, 43] }],
      },
    ],
    quiz: [
      {
        id: "q-ccna2-sec-1",
        prompt: { es: "¿Qué ataque intenta llenar la tabla MAC del switch?", en: "Which attack attempts to fill the switch MAC table?" },
        options: [
          { es: "MAC flooding", en: "MAC flooding" },
          { es: "SLAAC", en: "SLAAC" },
          { es: "OSPF cost manipulation", en: "OSPF cost manipulation" },
          { es: "CAPWAP tunneling", en: "CAPWAP tunneling" },
        ],
        correctIndex: 0,
        explanation: {
          es: "MAC flooding fuerza muchas MAC falsas para degradar el switch y provocar inundación de tráfico.",
          en: "MAC flooding injects many fake MACs to degrade the switch and cause traffic flooding.",
        },
      },
      {
        id: "q-ccna2-sec-2",
        prompt: { es: "¿Qué puertos deben marcarse como trusted para DHCP snooping?", en: "Which ports should be marked trusted for DHCP snooping?" },
        options: [
          { es: "Solo enlaces hacia servidores DHCP legítimos o uplinks confiables", en: "Only links toward legitimate DHCP servers or trusted uplinks" },
          { es: "Todos los puertos de usuario", en: "All user ports" },
          { es: "Cualquier puerto con PortFast", en: "Any PortFast port" },
          { es: "Puertos apagados", en: "Shutdown ports" },
        ],
        correctIndex: 0,
        explanation: {
          es: "Los puertos access de usuarios normalmente quedan untrusted para bloquear servidores DHCP falsos.",
          en: "User access ports normally remain untrusted to block rogue DHCP servers.",
        },
      },
      {
        id: "q-ccna2-sec-3",
        prompt: { es: "¿Qué función usa la base de DHCP snooping para validar ARP?", en: "Which feature uses the DHCP snooping database to validate ARP?" },
        options: [
          { es: "Dynamic ARP Inspection", en: "Dynamic ARP Inspection" },
          { es: "EtherChannel", en: "EtherChannel" },
          { es: "Router-on-a-stick", en: "Router-on-a-stick" },
          { es: "RIPng", en: "RIPng" },
        ],
        correctIndex: 0,
        explanation: {
          es: "DAI compara mensajes ARP contra asociaciones IP-MAC válidas aprendidas por DHCP snooping.",
          en: "DAI compares ARP messages against valid IP-MAC bindings learned by DHCP snooping.",
        },
      },
    ],
  },
  {
    id: "dhcp-dhcpv6",
    title: { es: "DHCP y DHCPv6", en: "DHCP and DHCPv6" },
    description: {
      es: "Pools IPv4, gateway, DNS, SLAAC y DHCPv6 stateless.",
      en: "IPv4 pools, gateway, DNS, SLAAC, and stateless DHCPv6.",
    },
    difficulty: "Intermedio",
    estimatedMinutes: 45,
    lessons: [
      {
        id: "dhcp-dhcpv6-lesson",
        title: { es: "Asignación automática de parámetros", en: "Automatic parameter assignment" },
        objective: {
          es: "Crear pools DHCP IPv4 y servicios DHCPv6 stateless para clientes de campus.",
          en: "Create IPv4 DHCP pools and stateless DHCPv6 services for campus clients.",
        },
        summary: {
          es: "DHCP entrega IP, máscara, gateway y DNS en IPv4. En IPv6, SLAAC puede dar la dirección y DHCPv6 stateless entregar opciones como DNS mediante other-config-flag.",
          en: "DHCP provides IP, mask, gateway, and DNS in IPv4. In IPv6, SLAAC can provide the address and stateless DHCPv6 can provide options such as DNS through other-config-flag.",
        },
        keyTerms: [
          { es: "pool DHCP", en: "DHCP pool" },
          { es: "default-router", en: "default-router" },
          { es: "DNS", en: "DNS" },
          { es: "stateless", en: "stateless" },
        ],
        example: {
          es: "Un router de campus entrega 192.168.10.0/24 con default-router 192.168.10.1 y DNS 8.8.8.8; para IPv6 anuncia RA y asigna DNS por DHCPv6.",
          en: "A campus router serves 192.168.10.0/24 with default-router 192.168.10.1 and DNS 8.8.8.8; for IPv6 it advertises RA and assigns DNS by DHCPv6.",
        },
        practice: {
          es: "Configura un pool DHCP para una VLAN de datos y un pool DHCPv6 stateless. Verifica dirección, gateway y DNS en clientes Packet Tracer.",
          en: "Configure a DHCP pool for a data VLAN and a stateless DHCPv6 pool. Verify address, gateway, and DNS on Packet Tracer clients.",
        },
        knowledgeEntryId: "dhcp-dhcpv6",
        sourceRefs: [
          { sourceId: "escenario-campus", pages: [3] },
          { sourceId: "vlan-stp-etherchannel-voip", pages: [66, 67] },
        ],
      },
    ],
    quiz: [
      {
        id: "q-dhcp-1",
        prompt: { es: "¿Qué parámetro DHCP IPv4 entrega el gateway a los clientes?", en: "Which IPv4 DHCP parameter gives clients their gateway?" },
        options: [
          { es: "default-router", en: "default-router" },
          { es: "dns-server", en: "dns-server" },
          { es: "option 150", en: "option 150" },
          { es: "router-id", en: "router-id" },
        ],
        correctIndex: 0,
        explanation: {
          es: "default-router define la puerta de enlace predeterminada que recibe el cliente.",
          en: "default-router defines the default gateway received by the client.",
        },
      },
      {
        id: "q-dhcp-2",
        prompt: { es: "En DHCPv6 stateless, ¿qué indica a los hosts que pidan información adicional?", en: "In stateless DHCPv6, what tells hosts to request additional information?" },
        options: [
          { es: "ipv6 nd other-config-flag", en: "ipv6 nd other-config-flag" },
          { es: "switchport mode trunk", en: "switchport mode trunk" },
          { es: "spanning-tree portfast", en: "spanning-tree portfast" },
          { es: "number 1001", en: "number 1001" },
        ],
        correctIndex: 0,
        explanation: {
          es: "El other-config-flag indica que la dirección puede venir por RA/SLAAC y opciones como DNS por DHCPv6.",
          en: "The other-config-flag indicates the address can come from RA/SLAAC and options such as DNS from DHCPv6.",
        },
      },
      {
        id: "q-dhcp-3",
        prompt: { es: "Un cliente recibe IP pero no resuelve nombres. ¿Qué línea del pool revisarías?", en: "A client receives an IP but cannot resolve names. Which pool line would you check?" },
        options: [
          { es: "dns-server", en: "dns-server" },
          { es: "channel-group", en: "channel-group" },
          { es: "mac-address", en: "mac-address" },
          { es: "router ospf", en: "router ospf" },
        ],
        correctIndex: 0,
        explanation: {
          es: "dns-server entrega el servidor de resolución de nombres al cliente.",
          en: "dns-server gives the name resolution server to the client.",
        },
      },
    ],
  },
  {
    id: "ccna2-fhrp",
    title: { es: "FHRP y gateways redundantes", en: "FHRP and redundant gateways" },
    description: {
      es: "HSRP, VRRP, GLBP, gateway virtual, prioridad, preempt y verificación.",
      en: "HSRP, VRRP, GLBP, virtual gateway, priority, preempt, and verification.",
    },
    difficulty: "Avanzado",
    estimatedMinutes: 45,
    lessons: [
      {
        id: "ccna2-fhrp-lesson",
        title: { es: "Alta disponibilidad del gateway", en: "Gateway high availability" },
        objective: {
          es: "Diseñar y verificar un gateway predeterminado redundante para una VLAN.",
          en: "Design and verify a redundant default gateway for a VLAN.",
        },
        summary: {
          es: "FHRP permite que varios routers o switches multicapa compartan una IP/MAC virtual como gateway de los hosts. HSRP elige un router activo y uno standby; prioridad y preempt controlan quién retoma el rol activo cuando vuelve a estar disponible.",
          en: "FHRP lets multiple routers or multilayer switches share a virtual IP/MAC as the hosts' gateway. HSRP elects an active router and a standby router; priority and preempt control who resumes active role when available again.",
        },
        keyTerms: [
          { es: "HSRP", en: "HSRP" },
          { es: "gateway virtual", en: "virtual gateway" },
          { es: "standby", en: "standby" },
          { es: "preempt", en: "preempt" },
        ],
        example: {
          es: "R1 y R2 comparten 192.168.10.1 como gateway virtual de VLAN 10. Si R1 falla, R2 responde por la IP virtual sin cambiar la configuración de los PCs.",
          en: "R1 and R2 share 192.168.10.1 as VLAN 10's virtual gateway. If R1 fails, R2 answers for the virtual IP without changing PC configuration.",
        },
        practice: {
          es: "Crea dos routers hacia una misma VLAN, configura standby 10 ip 192.168.10.1, prioridad mayor en R1 y standby 10 preempt. Verifica con show standby brief y apaga el enlace de R1.",
          en: "Create two routers toward the same VLAN, configure standby 10 ip 192.168.10.1, higher priority on R1, and standby 10 preempt. Verify with show standby brief and shut R1's link.",
        },
        knowledgeEntryId: "ccna2-fhrp",
        sourceRefs: [{ sourceId: "routing-fundamentals", pages: [20, 35, 36, 46] }],
      },
    ],
    quiz: [
      {
        id: "q-ccna2-fhrp-1",
        prompt: { es: "¿Qué problema resuelve un FHRP como HSRP?", en: "What problem does an FHRP such as HSRP solve?" },
        options: [
          { es: "Falla del gateway predeterminado", en: "Default gateway failure" },
          { es: "Agotamiento de direcciones IPv6", en: "IPv6 address exhaustion" },
          { es: "Colisiones Wi-Fi", en: "Wi-Fi collisions" },
          { es: "Errores de DNS únicamente", en: "DNS-only errors" },
        ],
        correctIndex: 0,
        explanation: {
          es: "FHRP mantiene una IP virtual de gateway aunque falle el router activo.",
          en: "FHRP keeps a virtual gateway IP available even if the active router fails.",
        },
      },
      {
        id: "q-ccna2-fhrp-2",
        prompt: { es: "¿Qué comando permite que el router con mayor prioridad retome el rol activo?", en: "Which command lets the higher-priority router retake the active role?" },
        options: [
          { es: "standby 10 preempt", en: "standby 10 preempt" },
          { es: "switchport mode trunk", en: "switchport mode trunk" },
          { es: "ip dhcp snooping trust", en: "ip dhcp snooping trust" },
          { es: "ipv6 nd other-config-flag", en: "ipv6 nd other-config-flag" },
        ],
        correctIndex: 0,
        explanation: {
          es: "preempt permite que un router con prioridad superior vuelva a ser activo cuando se recupera.",
          en: "preempt allows a higher-priority router to become active again when it recovers.",
        },
      },
      {
        id: "q-ccna2-fhrp-3",
        prompt: { es: "¿Qué comando verifica el estado HSRP resumido?", en: "Which command verifies summarized HSRP state?" },
        options: [
          { es: "show standby brief", en: "show standby brief" },
          { es: "show vlan brief", en: "show vlan brief" },
          { es: "show arp inspection", en: "show arp inspection" },
          { es: "show capwap client config", en: "show capwap client config" },
        ],
        correctIndex: 0,
        explanation: {
          es: "show standby brief muestra grupos HSRP, prioridad, estado activo/standby e IP virtual.",
          en: "show standby brief shows HSRP groups, priority, active/standby state, and virtual IP.",
        },
      },
    ],
  },
  {
    id: "ccna2-static-route-troubleshooting",
    title: { es: "Rutas estáticas y troubleshooting", en: "Static routes and troubleshooting" },
    description: {
      es: "Rutas conectadas, next-hop, rutas flotantes, resumen, default IPv4/IPv6 y diagnóstico.",
      en: "Connected routes, next hop, floating routes, summarization, IPv4/IPv6 defaults, and troubleshooting.",
    },
    difficulty: "Avanzado",
    estimatedMinutes: 60,
    lessons: [
      {
        id: "ccna2-static-route-troubleshooting-lesson",
        title: { es: "Diagnóstico de rutas estáticas y default", en: "Static and default route diagnosis" },
        objective: {
          es: "Configurar y solucionar rutas estáticas IPv4/IPv6, incluidas rutas flotantes y predeterminadas.",
          en: "Configure and troubleshoot IPv4/IPv6 static routes, including floating and default routes.",
        },
        summary: {
          es: "Una ruta estática puede usar interfaz de salida, next-hop o ambos. Una ruta flotante usa distancia administrativa mayor para actuar como respaldo. En troubleshooting se revisa estado de interfaces, tabla de routing, coincidencia de prefijo, next-hop alcanzable y ruta de retorno.",
          en: "A static route can use an exit interface, next hop, or both. A floating route uses a higher administrative distance to act as backup. Troubleshooting checks interface state, routing table, prefix match, reachable next hop, and return path.",
        },
        keyTerms: [
          { es: "distancia administrativa", en: "administrative distance" },
          { es: "ruta flotante", en: "floating route" },
          { es: "ruta host", en: "host route" },
          { es: "ruta de retorno", en: "return route" },
        ],
        example: {
          es: "ip route 0.0.0.0 0.0.0.0 10.0.0.1 5 crea una default de respaldo si la ruta principal tiene una distancia menor.",
          en: "ip route 0.0.0.0 0.0.0.0 10.0.0.1 5 creates a backup default if the primary route has a lower distance.",
        },
        practice: {
          es: "Configura una ruta estática principal y una flotante entre tres routers. Desconecta el enlace principal y verifica convergencia con show ip route, ping y traceroute. Repite con ipv6 route ::/0.",
          en: "Configure a primary static route and a floating route between three routers. Disconnect the primary link and verify convergence with show ip route, ping, and traceroute. Repeat with ipv6 route ::/0.",
        },
        knowledgeEntryId: "ccna2-static-route-troubleshooting",
        sourceRefs: [{ sourceId: "routing-fundamentals", pages: [20, 35, 36, 46] }],
      },
    ],
    quiz: [
      {
        id: "q-ccna2-static-1",
        prompt: { es: "¿Qué hace una ruta estática flotante?", en: "What does a floating static route do?" },
        options: [
          { es: "Actúa como respaldo con mayor distancia administrativa", en: "Acts as backup with higher administrative distance" },
          { es: "Reemplaza DHCPv6", en: "Replaces DHCPv6" },
          { es: "Agrupa enlaces físicos", en: "Bundles physical links" },
          { es: "Cifra contraseñas", en: "Encrypts passwords" },
        ],
        correctIndex: 0,
        explanation: {
          es: "La ruta flotante solo aparece si desaparece la ruta preferida con menor distancia administrativa.",
          en: "The floating route appears only if the preferred lower-distance route disappears.",
        },
      },
      {
        id: "q-ccna2-static-2",
        prompt: { es: "Ping de ida llega al destino, pero no hay respuesta. ¿Qué revisarías además de la ruta local?", en: "The outbound ping reaches the destination, but no reply returns. What else should you check besides the local route?" },
        options: [
          { es: "Ruta de retorno en el router remoto", en: "Return route on the remote router" },
          { es: "Nombre de la VLAN nativa", en: "Native VLAN name" },
          { es: "WPA2 passphrase", en: "WPA2 passphrase" },
          { es: "Máximo de ephones", en: "Maximum ephones" },
        ],
        correctIndex: 0,
        explanation: {
          es: "La conectividad IP necesita ruta de ida y ruta de retorno para que el eco ICMP vuelva.",
          en: "IP connectivity needs a forward path and a return path for the ICMP echo reply.",
        },
      },
      {
        id: "q-ccna2-static-3",
        prompt: { es: "¿Cuál es una ruta predeterminada IPv6 válida?", en: "Which is a valid IPv6 default route?" },
        options: [
          { es: "ipv6 route ::/0 2001:db8:1::2", en: "ipv6 route ::/0 2001:db8:1::2" },
          { es: "ip route ::/0 10.0.0.1", en: "ip route ::/0 10.0.0.1" },
          { es: "ipv6 default-gateway 0.0.0.0", en: "ipv6 default-gateway 0.0.0.0" },
          { es: "route ipv6 default vlan 1", en: "route ipv6 default vlan 1" },
        ],
        correctIndex: 0,
        explanation: {
          es: "::/0 representa la ruta predeterminada IPv6.",
          en: "::/0 represents the IPv6 default route.",
        },
      },
    ],
  },
  {
    id: "voip-cme-campus",
    title: { es: "VoIP y Call Manager Express", en: "VoIP and Call Manager Express" },
    description: {
      es: "VLAN de voz, opción 150, telephony-service, ephone-dn y teléfonos IP.",
      en: "Voice VLAN, option 150, telephony-service, ephone-dn, and IP phones.",
    },
    difficulty: "Avanzado",
    estimatedMinutes: 55,
    lessons: [
      {
        id: "voip-cme-campus-lesson",
        title: { es: "Telefonía IP en un campus", en: "IP telephony in a campus" },
        objective: {
          es: "Integrar VLAN de voz, DHCP y CME para registrar teléfonos IP y extensiones.",
          en: "Integrate voice VLAN, DHCP, and CME to register IP phones and extensions.",
        },
        summary: {
          es: "Un entorno VoIP separa tráfico de voz en una VLAN dedicada. DHCP debe entregar opción 150 hacia TFTP/CME y CME define servicio, extensiones y teléfonos por MAC.",
          en: "A VoIP environment separates voice traffic in a dedicated VLAN. DHCP must provide option 150 toward TFTP/CME, and CME defines service, extensions, and phones by MAC.",
        },
        keyTerms: [
          { es: "VLAN de voz", en: "voice VLAN" },
          { es: "opción 150", en: "option 150" },
          { es: "telephony-service", en: "telephony-service" },
          { es: "ephone-dn", en: "ephone-dn" },
        ],
        example: {
          es: "El teléfono obtiene IP por DHCP, aprende el servidor CME con option 150 y descarga su configuración para registrar la extensión 1001.",
          en: "The phone gets an IP by DHCP, learns the CME server through option 150, and downloads its configuration to register extension 1001.",
        },
        practice: {
          es: "En Packet Tracer configura VLAN de voz, pool VOIP con option 150, telephony-service, dos ephone-dn y llama entre extensiones.",
          en: "In Packet Tracer configure voice VLAN, VOIP pool with option 150, telephony-service, two ephone-dn entries, and call between extensions.",
        },
        knowledgeEntryId: "voip-cme-campus",
        sourceRefs: [{ sourceId: "escenario-campus", pages: [1, 3, 4] }],
      },
    ],
    quiz: [
      {
        id: "q-voip-1",
        prompt: { es: "¿Qué opción DHCP apunta al TFTP/CME para teléfonos IP Cisco?", en: "Which DHCP option points Cisco IP phones to TFTP/CME?" },
        options: [
          { es: "option 150", en: "option 150" },
          { es: "default-router", en: "default-router" },
          { es: "native vlan", en: "native vlan" },
          { es: "router-id", en: "router-id" },
        ],
        correctIndex: 0,
        explanation: {
          es: "option 150 entrega la IP del servidor TFTP/CME que usará el teléfono.",
          en: "option 150 provides the TFTP/CME server IP used by the phone.",
        },
      },
      {
        id: "q-voip-2",
        prompt: { es: "¿Qué bloque define números de extensión en CME?", en: "Which block defines extension numbers in CME?" },
        options: [
          { es: "ephone-dn", en: "ephone-dn" },
          { es: "ipv6 router ospf", en: "ipv6 router ospf" },
          { es: "interface port-channel", en: "interface port-channel" },
          { es: "ip dhcp excluded-address", en: "ip dhcp excluded-address" },
        ],
        correctIndex: 0,
        explanation: {
          es: "ephone-dn define los números/directorios; ephone asocia teléfonos por MAC y botones.",
          en: "ephone-dn defines directory numbers; ephone maps phones by MAC and buttons.",
        },
      },
      {
        id: "q-voip-3",
        prompt: { es: "Un teléfono recibe IP pero no registra. ¿Qué revisarías primero?", en: "A phone gets an IP but does not register. What would you check first?" },
        options: [
          { es: "option 150 y telephony-service", en: "option 150 and telephony-service" },
          { es: "OSPF cost", en: "OSPF cost" },
          { es: "WPA2 passphrase", en: "WPA2 passphrase" },
          { es: "Subnet broadcast", en: "Subnet broadcast" },
        ],
        correctIndex: 0,
        explanation: {
          es: "Si ya tiene IP, el registro depende de localizar CME/TFTP y de la configuración de telefonía.",
          en: "If it already has IP, registration depends on locating CME/TFTP and telephony configuration.",
        },
      },
    ],
  },
  {
    id: "wlan-wireless",
    title: { es: "WLAN y seguridad inalámbrica", en: "WLAN and wireless security" },
    description: {
      es: "802.11, asociación, canales, CAPWAP, WLC y seguridad WPA2/WPA3.",
      en: "802.11, association, channels, CAPWAP, WLC, and WPA2/WPA3 security.",
    },
    difficulty: "Intermedio",
    estimatedMinutes: 45,
    lessons: [
      {
        id: "wlan-wireless-lesson",
        title: { es: "Operación WLAN y control centralizado", en: "WLAN operation and centralized control" },
        objective: {
          es: "Explicar cómo se asocia un cliente Wi-Fi y cómo CAPWAP permite gestionar APs desde un WLC.",
          en: "Explain how a Wi-Fi client associates and how CAPWAP lets a WLC manage APs.",
        },
        summary: {
          es: "WLAN usa 802.11 y CSMA/CA. Un cliente descubre SSIDs, autentica y se asocia si coinciden seguridad y parámetros. CAPWAP usa UDP 5246/5247 para control y datos entre AP y WLC.",
          en: "WLAN uses 802.11 and CSMA/CA. A client discovers SSIDs, authenticates, and associates when security and parameters match. CAPWAP uses UDP 5246/5247 for control and data between AP and WLC.",
        },
        keyTerms: [
          { es: "SSID", en: "SSID" },
          { es: "CSMA/CA", en: "CSMA/CA" },
          { es: "CAPWAP", en: "CAPWAP" },
          { es: "WPA3", en: "WPA3" },
        ],
        example: {
          es: "En 2.4 GHz, tres APs cercanos pueden usar canales 1, 6 y 11 para reducir solapamiento y mejorar roaming.",
          en: "In 2.4 GHz, three nearby APs can use channels 1, 6, and 11 to reduce overlap and improve roaming.",
        },
        practice: {
          es: "Crea una WLAN con SSID seguro, configura WPA2-PSK/WPA3 si está disponible y valida asociación, DHCP y conectividad hacia la LAN.",
          en: "Create a WLAN with a secure SSID, configure WPA2-PSK/WPA3 if available, and validate association, DHCP, and LAN connectivity.",
        },
        knowledgeEntryId: "wlan-wireless",
        sourceRefs: [{ sourceId: "wlan", pages: [3, 4, 5, 6, 9, 11, 12, 13, 14, 16, 17] }],
      },
      {
        id: "wlan-wlc-config",
        title: { es: "Configuración WLAN en WLC", en: "WLAN configuration on a WLC" },
        objective: {
          es: "Configurar una WLAN básica en controlador inalámbrico y validar asociación de clientes.",
          en: "Configure a basic WLAN on a wireless controller and validate client association.",
        },
        summary: {
          es: "En CCNA 2 se espera reconocer parámetros de WLC: IP de administración, creación de WLAN con ID/perfil/SSID, seguridad WPA2/WPA3, interfaz o DHCP server asociado, habilitación de WLAN y verificación de clientes/AP.",
          en: "CCNA 2 expects recognizing WLC parameters: management IP, WLAN creation with ID/profile/SSID, WPA2/WPA3 security, associated interface or DHCP server, WLAN enablement, and client/AP verification.",
        },
        keyTerms: [
          { es: "WLC", en: "WLC" },
          { es: "perfil WLAN", en: "WLAN profile" },
          { es: "WPA2-PSK", en: "WPA2-PSK" },
          { es: "AP join", en: "AP join" },
        ],
        example: {
          es: "Una WLAN con SSID ESTUDIANTES usa WPA2-PSK, recibe DHCP desde la VLAN 10 y queda habilitada para los AP asociados al controlador.",
          en: "A WLAN with SSID STUDENTS uses WPA2-PSK, receives DHCP from VLAN 10, and is enabled for APs joined to the controller.",
        },
        practice: {
          es: "En Packet Tracer configura Management IP del WLC, crea WLAN ID 1 con SSID ESTUDIANTES, define WPA2-PSK, apunta DHCP server, habilita la WLAN y conecta un laptop inalámbrico.",
          en: "In Packet Tracer configure the WLC management IP, create WLAN ID 1 with SSID STUDENTS, set WPA2-PSK, point to the DHCP server, enable the WLAN, and connect a wireless laptop.",
        },
        knowledgeEntryId: "wlan-wireless",
        sourceRefs: [{ sourceId: "wlan", pages: [9, 11, 12, 13, 14, 16, 17] }],
      },
    ],
    quiz: [
      {
        id: "q-wlan-1",
        prompt: { es: "¿Qué canales no solapados se recomiendan en 2.4 GHz?", en: "Which non-overlapping channels are recommended in 2.4 GHz?" },
        options: [
          { es: "1, 6 y 11", en: "1, 6, and 11" },
          { es: "2, 4 y 8", en: "2, 4, and 8" },
          { es: "10, 20 y 30", en: "10, 20, and 30" },
          { es: "5246 y 5247", en: "5246 and 5247" },
        ],
        correctIndex: 0,
        explanation: {
          es: "En 2.4 GHz, 1, 6 y 11 reducen solapamiento entre APs cercanos.",
          en: "In 2.4 GHz, 1, 6, and 11 reduce overlap between nearby APs.",
        },
      },
      {
        id: "q-wlan-2",
        prompt: { es: "¿Qué protocolo permite a un WLC administrar APs?", en: "Which protocol lets a WLC manage APs?" },
        options: [
          { es: "CAPWAP", en: "CAPWAP" },
          { es: "RIPng", en: "RIPng" },
          { es: "PAgP", en: "PAgP" },
          { es: "CME", en: "CME" },
        ],
        correctIndex: 0,
        explanation: {
          es: "CAPWAP transporta control y datos entre AP y WLC, típicamente UDP 5246/5247.",
          en: "CAPWAP carries control and data between AP and WLC, typically UDP 5246/5247.",
        },
      },
      {
        id: "q-wlan-3",
        prompt: { es: "Un cliente ve el SSID pero no asocia. ¿Qué revisarías primero?", en: "A client sees the SSID but does not associate. What would you check first?" },
        options: [
          { es: "Modo de seguridad y clave", en: "Security mode and passphrase" },
          { es: "OSPF router-id", en: "OSPF router ID" },
          { es: "VLAN nativa del trunk WAN", en: "WAN trunk native VLAN" },
          { es: "Número ephone-dn", en: "ephone-dn number" },
        ],
        correctIndex: 0,
        explanation: {
          es: "Si el SSID es visible, asociación suele fallar por seguridad, clave o compatibilidad del cliente.",
          en: "If the SSID is visible, association commonly fails due to security, passphrase, or client compatibility.",
        },
      },
      {
        id: "q-wlan-4",
        prompt: { es: "En una configuración WLC, ¿qué parámetro representa el nombre visible para el cliente?", en: "In a WLC configuration, which parameter is the visible network name for the client?" },
        options: [
          { es: "SSID", en: "SSID" },
          { es: "Router ID", en: "Router ID" },
          { es: "Native VLAN", en: "Native VLAN" },
          { es: "HSRP priority", en: "HSRP priority" },
        ],
        correctIndex: 0,
        explanation: {
          es: "El SSID es el nombre de red que el cliente inalámbrico descubre y selecciona.",
          en: "The SSID is the network name the wireless client discovers and selects.",
        },
      },
    ],
  },
];

export const courseModules: CourseModule[] = baseCourseModules.map((module) => ensureMinimumQuizSize(module, 50));

// LAUNCH dashboard — Power Query (M) definitions.
// These load LIVE from the GitHub Pages data file, so the Power BI report
// refreshes with the site (no manual export needed).
//
// Setup in Power BI Desktop:
//   1. Get data → Blank query → Advanced Editor → paste the fnLaunchData
//      section → name the query exactly  fnLaunchData
//   2. For each table below (Meta, Products, Stages, Milestones, Countries,
//      JourneyGates, JourneySegments, Changelog): New blank query → paste →
//      name it as shown.
//   3. When prompted for privacy/credentials: Anonymous, Public.
//
// If the hosting URL changes (e.g. moved to RBM), edit DataUrl only.

// ============================ fnLaunchData ============================
let
    DataUrl = "https://kochrisdev.github.io/launch-transparency-dashboard/data/products.js",
    Source = Text.FromBinary(Web.Contents(DataUrl)),
    AfterMarker = Text.Trim(Text.AfterDelimiter(Source, "window.LAUNCH_DATA =")),
    NoSemicolon = if Text.EndsWith(AfterMarker, ";")
                  then Text.Start(AfterMarker, Text.Length(AfterMarker) - 1)
                  else AfterMarker,
    Json = Json.Document(NoSemicolon)
in
    Json

// ============================ Meta ============================
// let
//     d = fnLaunchData,
//     m = d[meta]
// in
//     Table.FromRecords({[lastUpdated = m[lastUpdated], dataStatus = m[dataStatus]]})

// ============================ Products ============================
// let
//     d = fnLaunchData,
//     StageNames = d[stages],
//     Tracked = List.Select(d[products], each not Record.FieldOrDefault(_, "placeholder", false)),
//     Rows = List.Transform(Tracked, each [
//         productId = [id], name = [name], inn = [inn], manufacturer = [manufacturer],
//         class = [class], classLabel = [classLabel],
//         phase = Record.FieldOrDefault(_, "phase", null),
//         currentStageIndex = [currentStage],
//         currentStageName = StageNames{[currentStage]},
//         flag = Record.FieldOrDefault(_, "flag", null),
//         priceValue = [detail][price][value],
//         priceConfirmedInWriting = [detail][price][confirmedInWriting],
//         useCase = [detail][useCase],
//         registered = Text.From([detail][country][registered]),
//         inGuidelines = Text.From([detail][country][inGuidelines]),
//         inMft = Text.From([detail][country][inMft]),
//         forecastDemand = [detail][country][forecastDemand]
//     ])
// in
//     Table.FromRecords(Rows)

// ============================ Stages ============================
// let
//     d = fnLaunchData,
//     StageNames = d[stages],
//     StatusLabel = [done = "Complete", prog = "In progress", late = "Delayed", idle = "Not started"],
//     StatusRank = [done = 3, prog = 2, late = 1, idle = 0],
//     Tracked = List.Select(d[products], each not Record.FieldOrDefault(_, "placeholder", false)),
//     Rows = List.Combine(List.Transform(Tracked, (p) =>
//         List.Transform(List.Positions(p[stages]), (i) =>
//             let s = p[stages]{i} in [
//                 productId = p[id], productName = p[name],
//                 stageIndex = i, stageName = StageNames{i},
//                 status = s[status],
//                 statusLabel = Record.Field(StatusLabel, s[status]),
//                 statusRank = Record.Field(StatusRank, s[status]),
//                 note = Record.FieldOrDefault(s, "note", ""),
//                 date = Record.FieldOrDefault(s, "date", ""),
//                 nextStep = Record.FieldOrDefault(s, "next", ""),
//                 anticipated = Record.FieldOrDefault(s, "nextDate", ""),
//                 source = Record.FieldOrDefault(s, "source", ""),
//                 asOf = Record.FieldOrDefault(s, "asOf", "")
//             ]))),
//     T = Table.FromRecords(Rows)
// in
//     T

// ============================ Milestones ============================
// let
//     d = fnLaunchData,
//     StatusLabel = [done = "Complete", prog = "In progress", late = "Delayed", idle = "Not started"],
//     Tracked = List.Select(d[products], each not Record.FieldOrDefault(_, "placeholder", false)),
//     Rows = List.Combine(List.Transform(Tracked, (p) =>
//         List.Transform(p[detail][milestones], (mi) => [
//             productId = p[id], productName = p[name],
//             milestone = mi[milestone], status = mi[status],
//             statusLabel = Record.Field(StatusLabel, mi[status]),
//             label = Record.FieldOrDefault(mi, "label", ""),
//             date = Record.FieldOrDefault(mi, "date", ""),
//             nextStep = Record.FieldOrDefault(mi, "next", ""),
//             anticipated = Record.FieldOrDefault(mi, "anticipated", ""),
//             source = Record.FieldOrDefault(mi, "source", "")
//         ]))),
//     T = Table.FromRecords(Rows)
// in
//     T

// ============================ Countries ============================
// let
//     d = fnLaunchData,
//     LevelLabel = [registered = "Registered", guidelines = "In national guidelines", mft = "In MFT plans"],
//     LevelRank = [registered = 1, guidelines = 2, mft = 3],
//     Tracked = List.Select(d[products], each not Record.FieldOrDefault(_, "placeholder", false)),
//     WithCountries = List.Select(Tracked, each Record.FieldOrDefault([detail], "countries", null) <> null),
//     Rows = List.Combine(List.Transform(WithCountries, (p) =>
//         List.Transform(p[detail][countries][list], (e) => [
//             productId = p[id], productName = p[name],
//             iso3 = e[iso3], level = e[level],
//             levelLabel = Record.Field(LevelLabel, e[level]),
//             levelRank = Record.Field(LevelRank, e[level]),
//             dataStatus = p[detail][countries][status]
//         ]))),
//     T = Table.FromRecords(Rows)
// in
//     T

// ============================ JourneyGates ============================
// let
//     d = fnLaunchData,
//     Tracked = List.Select(d[products], each not Record.FieldOrDefault(_, "placeholder", false)),
//     WithJourney = List.Select(Tracked, each Record.FieldOrDefault([detail], "journey", null) <> null),
//     Rows = List.Combine(List.Transform(WithJourney, (p) =>
//         List.Transform(List.Positions(p[detail][journey]), (i) =>
//             let g = p[detail][journey]{i} in [
//                 productId = p[id], productName = p[name],
//                 gateIndex = i, gateLabel = g[label], year = Text.From(g[year])
//             ]))),
//     T = Table.FromRecords(Rows)
// in
//     T

// ============================ JourneySegments ============================
// let
//     d = fnLaunchData,
//     NowYear = Number.FromText(Text.Start(d[meta][lastUpdated], 4)),
//     Tracked = List.Select(d[products], each not Record.FieldOrDefault(_, "placeholder", false)),
//     PerProduct = List.Transform(Tracked, (p) =>
//         let
//             journey = Record.FieldOrDefault(p[detail], "journey", {}),
//             dated = List.Select(journey, each Value.Is([year], type number)),
//             pairs = if List.Count(dated) < 2 then {} else
//                 List.Transform({1..List.Count(dated) - 1}, (i) =>
//                     let a = dated{i - 1}, b = dated{i}, gap = b[year] - a[year] in
//                     if gap = 0 then null else [
//                         productId = p[id], productName = p[name],
//                         fromGate = a[label], toGate = b[label],
//                         startYear = a[year], endYear = b[year], years = gap,
//                         pace = if gap <= 2 then "On track" else if gap <= 5 then "Slow" else "Delayed"
//                     ]),
//             hasPending = List.Count(List.Select(journey, each [year] = "TBC")) > 0,
//             last = if List.Count(dated) > 0 then List.Last(dated) else null,
//             pending = if hasPending and last <> null and last[year] < NowYear then {[
//                 productId = p[id], productName = p[name],
//                 fromGate = last[label], toGate = "next gate (pending)",
//                 startYear = last[year], endYear = NowYear,
//                 years = NowYear - last[year], pace = "Pending"
//             ]} else {}
//         in
//             List.RemoveNulls(pairs) & pending),
//     T = Table.FromRecords(List.Combine(PerProduct))
// in
//     T

// ============================ Changelog ============================
// let
//     d = fnLaunchData,
//     T = Table.FromRecords(List.Transform(d[changelog],
//         each [date = [date], product = [product], change = [change]])),
//     Typed = Table.TransformColumnTypes(T, {{"date", type date}})
// in
//     Typed

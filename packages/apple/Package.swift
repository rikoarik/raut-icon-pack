// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "RautIcons",
    platforms: [.iOS(.v15), .macOS(.v12)],
    products: [.library(name: "RautIcons", targets: ["RautIcons"])],
    targets: [.target(name: "RautIcons", resources: [.process("Icons.xcassets")])]
)

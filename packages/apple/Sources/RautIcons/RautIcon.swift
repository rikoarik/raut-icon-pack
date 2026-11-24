import SwiftUI

/// An outline icon loaded from the package's local vector assets.
public struct RautIcon: View {
    public let name: RautIconName
    public let size: CGFloat
    public let label: String?

    public init(_ name: RautIconName, size: CGFloat = 24, label: String? = nil) {
        self.name = name
        self.size = size
        self.label = label
    }

    public var body: some View {
        Image("rautglyph\(name.rawValue.replacingOccurrences(of: "-", with: ""))v", bundle: .module)
            .renderingMode(.template)
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityLabel(Text(label ?? ""))
            .accessibilityHidden(label == nil)
    }
}

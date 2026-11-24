plugins { id("com.android.application") version "9.0.1" }

android {
    namespace = "dev.raut.smoke"
    compileSdk = 36
    defaultConfig {
        applicationId = "dev.raut.smoke"
        minSdk = 24
        targetSdk = 36
    }
}

dependencies { implementation("dev.roundedicons:rounded-icons-android:0.1.0") }

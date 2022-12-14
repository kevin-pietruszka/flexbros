import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonInput,
    IonButton,
} from "@ionic/react";
import { useState } from "react";

/* Firebase imports */
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initNewUser } from "../db";
import { useHistory } from "react-router";

const CreateAccount: React.FC = () => {
    let history = useHistory();

    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");

    const firebaseConfig = {
        apiKey: "AIzaSyCCoXcYl2kHu4Vso_PMhVXhMdLaj7C2whY",
        authDomain: "flexbros-e3945.firebaseapp.com",
        projectId: "flexbros-e3945",
        storageBucket: "flexbros-e3945.appspot.com",
        messagingSenderId: "662856376755",
        appId: "1:662856376755:web:8c5f664896d935730f2bc6",
        measurementId: "G-RY4NMVS1EC",
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const createAccount = async () => {
        if (!(validatePassword(password1) && validatePassword(password2))) {
            alert(
                "Password do not have 7-15 characters, one numeric, and one special character"
            );
            return;
        }

        if (password1 === password2) {
            createUserWithEmailAndPassword(auth, email, password1)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    initNewUser(user.uid);

                    history.push("/tab1");
                })
                .catch((error) => {
                    alert("Please try again");
                    console.log(error);
                });
        } else {
            alert("Passwords do not match");
        }
    };

    const validatePassword = (pw: string) => {
        return pw.match(
            /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
        );
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle class="ion-text-center">Create Account</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Create Account</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonList>
                    <IonItem>
                        <IonInput
                            placeholder="Email"
                            onIonInput={(e: any) => setEmail(e.target.value)}
                        ></IonInput>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            type="password"
                            placeholder="Password"
                            onIonInput={(e: any) =>
                                setPassword1(e.target.value)
                            }
                        ></IonInput>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            type="password"
                            placeholder="Confirm Password"
                            onIonInput={(e: any) =>
                                setPassword2(e.target.value)
                            }
                        ></IonInput>
                    </IonItem>
                    <IonButton onClick={(e: any) => createAccount()}>
                        Create
                    </IonButton>
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default CreateAccount;

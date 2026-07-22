/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// A GizmoActionLabel value must match the name of a PolyList in the gizmo Drawable.
// When the user clicks and drags that PolyList, GizmoManager runs the action it identifies.
export enum GizmoActionLabel {
    TranslateX = "TranslateX",
    TranslateY = "TranslateY",
    TranslateZ = "TranslateZ",
    TranslateXY = "TranslateXY",
    TranslateXZ = "TranslateXZ",
    TranslateYZ = "TranslateYZ",
    RotateX = "RotateX",
    RotateY = "RotateY",
    RotateZ = "RotateZ",
    Scale = "Scale",
    ScaleX = "ScaleX",
    ScaleY = "ScaleY",
    ScaleZ = "ScaleZ"
}

export default GizmoActionLabel;

export const GizmoActionLabels: string[] = Object.values(GizmoActionLabel);
